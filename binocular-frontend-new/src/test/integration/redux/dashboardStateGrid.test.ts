// I3 — dashboardReducer: state grid + localStorage persistence
//
// Verifies that the 40×40 dashboardState grid remains consistent with
// dashboardItems across add/move/delete/clear, that collision detection
// rejects illegal moves, and that localStorage is kept in sync.
//
// localStorage key: `${Config.localStoragePrefix}dashboardStateV${Config.localStorageVersion}`

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Config from '../../../config.ts';
import { configureStore } from '@reduxjs/toolkit';

import DashboardReducer, {
  addDashboardItem,
  moveDashboardItem,
  deleteDashboardItem,
  clearDashboard,
  setDashboardState,
} from '../../../redux/reducer/general/dashboardReducer.ts';
import type { DashboardItemType } from '../../../types/general/dashboardItemType.ts';

const LS_KEY = `${Config.localStoragePrefix}dashboardStateV${Config.localStorageVersion}`;

function createStore() {
  return configureStore({ reducer: { dashboard: DashboardReducer } });
}

/** Returns the set of (y,x) grid positions occupied by the given item id. */
function occupiedCells(grid: number[][], id: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === id) cells.push([y, x]);
    }
  }
  return cells;
}

const item2x2: Omit<DashboardItemType, 'id'> = {
  width: 2,
  height: 2,
  dataPluginId: undefined,
  settings: undefined,
};

describe('I3 — dashboardReducer: state grid + localStorage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  // ── I3.1 — addDashboardItem auto-assigns id ───────────────────────────────

  it('I3.1 — addDashboardItem auto-assigns id: 1 on first item', () => {
    const store = createStore();
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    expect(store.getState().dashboard.dashboardItems[0].id).toBe(1);
  });

  // ── I3.2 — added item marks correct grid cells ────────────────────────────

  it('I3.2 — added 2×2 item marks exactly 4 grid cells with its id', () => {
    const store = createStore();
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    const { dashboardItems, dashboardState } = store.getState().dashboard;
    const item = dashboardItems[0];

    const cells = occupiedCells(dashboardState, item.id);
    expect(cells).toHaveLength(4);
  });

  // ── I3.3 — two items do not overlap ──────────────────────────────────────

  it('I3.3 — two items placed sequentially do not share any grid cells', () => {
    const store = createStore();
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));

    const { dashboardItems, dashboardState } = store.getState().dashboard;
    const [a, b] = dashboardItems;
    const cellsA = occupiedCells(dashboardState, a.id);
    const cellsB = occupiedCells(dashboardState, b.id);

    const overlap = cellsA.filter(([y, x]) => cellsB.some(([by, bx]) => by === y && bx === x));
    expect(overlap).toHaveLength(0);
  });

  // ── I3.4 — moveDashboardItem updates grid ────────────────────────────────

  it('I3.4 — moveDashboardItem clears old cells and fills new cells', () => {
    const store = createStore();
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    const item = store.getState().dashboard.dashboardItems[0];

    // Move to a free area far from origin
    const moved: DashboardItemType = { ...item, x: 10, y: 10 };
    store.dispatch(moveDashboardItem(moved));

    const { dashboardState } = store.getState().dashboard;

    // Old cells should be cleared
    const oldCells = occupiedCells(dashboardState, item.id).filter(([y, x]) => y < 4 && x < 4);
    expect(oldCells).toHaveLength(0);

    // New position cells should be filled
    expect(dashboardState[10][10]).toBe(item.id);
    expect(dashboardState[11][11]).toBe(item.id);
  });

  // ── I3.5 — moveDashboardItem to occupied cell is rejected ─────────────────

  it('I3.5 — moveDashboardItem to an occupied cell leaves item unmoved', () => {
    const store = createStore();
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));

    const [a, b] = store.getState().dashboard.dashboardItems;
    const originalPos = { x: a.x, y: a.y };

    // Try to move item A onto item B's position
    store.dispatch(moveDashboardItem({ ...a, x: b.x, y: b.y }));

    const movedItem = store.getState().dashboard.dashboardItems[0];
    expect(movedItem.x).toBe(originalPos.x);
    expect(movedItem.y).toBe(originalPos.y);
  });

  // ── I3.6 — deleteDashboardItem removes item and clears cells ─────────────

  it('I3.6 — deleteDashboardItem removes item and zeros its grid cells', () => {
    const store = createStore();
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    const item = store.getState().dashboard.dashboardItems[0];

    store.dispatch(deleteDashboardItem(item));

    expect(store.getState().dashboard.dashboardItems).toHaveLength(0);
    const cells = occupiedCells(store.getState().dashboard.dashboardState, item.id);
    expect(cells).toHaveLength(0);
  });

  // ── I3.7 — clearDashboard resets everything ───────────────────────────────

  it('I3.7 — clearDashboard resets items, count, and all grid cells to 0', () => {
    const store = createStore();
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));

    store.dispatch(clearDashboard());

    const { dashboardItems, dashboardItemCount, dashboardState } = store.getState().dashboard;
    expect(dashboardItems).toHaveLength(0);
    expect(dashboardItemCount).toBe(0);
    const nonZero = dashboardState.flat().filter((v: number) => v !== 0);
    expect(nonZero).toHaveLength(0);
  });

  // ── I3.8 — setDashboardState rebuilds grid from supplied items ────────────

  it('I3.8 — setDashboardState rebuilds grid from supplied items', () => {
    const store = createStore();
    const items: DashboardItemType[] = [
      { id: 0, x: 0, y: 0, width: 2, height: 2, dataPluginId: undefined },
      { id: 0, x: 5, y: 5, width: 3, height: 3, dataPluginId: undefined },
    ];
    store.dispatch(setDashboardState(items));

    const { dashboardItems, dashboardState } = store.getState().dashboard;
    expect(dashboardItems).toHaveLength(2);
    // First item placed at (0,0)
    expect(dashboardState[0][0]).toBe(dashboardItems[0].id);
    // Second item placed at (5,5)
    expect(dashboardState[5][5]).toBe(dashboardItems[1].id);
  });

  // ── I3.9 — every mutation persists to localStorage ────────────────────────

  it('I3.9 — addDashboardItem persists to localStorage', () => {
    const store = createStore();
    store.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    const raw = localStorage.getItem(LS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.dashboardItems).toHaveLength(1);
  });

  // ── I3.10 — store hydrates from localStorage ──────────────────────────────

  it('I3.10 — store hydrates dashboardItems and dashboardItemCount from localStorage', () => {
    // Seed by mutating via store, then recreate
    const store1 = createStore();
    store1.dispatch(addDashboardItem(item2x2 as DashboardItemType));
    store1.dispatch(addDashboardItem(item2x2 as DashboardItemType));

    const store2 = createStore();
    expect(store2.getState().dashboard.dashboardItems).toHaveLength(2);
    expect(store2.getState().dashboard.dashboardItemCount).toBe(2);
  });
});
