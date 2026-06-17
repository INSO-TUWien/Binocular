// I12 — layoutReducer + localStorage
//
// Verifies that the layout reducer correctly manages custom dashboard layouts
// and persists state to/from localStorage using the key `${Config.localStoragePrefix}layoutStateV${Config.localStorageVersion}`.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Config from '../../../config.ts';
import { configureStore } from '@reduxjs/toolkit';

import LayoutReducer, { addCustomLayout, deleteCustomLayout } from '../../../redux/reducer/general/layoutReducer.ts';
import { DashboardLayoutCategory } from '../../../types/general/dashboardLayoutType.ts';
import type { DashboardLayout } from '../../../types/general/dashboardLayoutType.ts';

const LS_KEY = `${Config.localStoragePrefix}layoutStateV${Config.localStorageVersion}`;

function createStore() {
  return configureStore({ reducer: { layout: LayoutReducer } });
}

const baseLayout: DashboardLayout = {
  name: 'Test Layout',
  category: DashboardLayoutCategory.CUSTOM,
  items: [],
};

describe('I12 — layoutReducer + localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── I12.1 — fresh store writes initial state ──────────────────────────────

  it('I12.1 — fresh store writes { customLayouts: [], customLayoutCount: 0 } to localStorage', () => {
    createStore();
    const raw = localStorage.getItem(LS_KEY);
    expect(raw).not.toBeNull();
    const state = JSON.parse(raw!);
    expect(state.customLayouts).toEqual([]);
    expect(state.customLayoutCount).toBe(0);
  });

  // ── I12.2 — addCustomLayout assigns id and persists ───────────────────────

  it('I12.2 — addCustomLayout assigns id via customLayoutCount and persists', () => {
    const store = createStore();
    store.dispatch(addCustomLayout(baseLayout));

    const layouts = store.getState().layout.customLayouts;
    expect(layouts).toHaveLength(1);
    expect(layouts[0].id).toBe(0); // first id = customLayoutCount before increment = 0

    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.customLayouts).toHaveLength(1);
  });

  // ── I12.3 — two layouts get distinct IDs ─────────────────────────────────

  it('I12.3 — two addCustomLayout calls assign distinct IDs', () => {
    const store = createStore();
    store.dispatch(addCustomLayout({ ...baseLayout, name: 'Layout A' }));
    store.dispatch(addCustomLayout({ ...baseLayout, name: 'Layout B' }));

    const layouts = store.getState().layout.customLayouts;
    expect(layouts).toHaveLength(2);
    expect(layouts[0].id).not.toBe(layouts[1].id);
  });

  // ── I12.4 — deleteCustomLayout removes entry and persists ─────────────────

  it('I12.4 — deleteCustomLayout removes entry and persists', () => {
    const store = createStore();
    store.dispatch(addCustomLayout(baseLayout));

    const id = store.getState().layout.customLayouts[0].id!;
    store.dispatch(deleteCustomLayout(id));

    expect(store.getState().layout.customLayouts).toHaveLength(0);
    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.customLayouts).toHaveLength(0);
  });

  // ── I12.5 — store hydrates customLayouts from pre-seeded localStorage ──────

  it('I12.5 — store hydrates customLayouts from pre-seeded localStorage', () => {
    const seeded = {
      customLayouts: [{ id: 7, name: 'Seeded', category: DashboardLayoutCategory.CUSTOM, items: [] }],
      customLayoutCount: 8,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(seeded));

    const store = createStore();
    expect(store.getState().layout.customLayouts).toHaveLength(1);
    expect(store.getState().layout.customLayouts[0].id).toBe(7);
    expect(store.getState().layout.customLayoutCount).toBe(8);
  });
});
