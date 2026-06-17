// I4 — tabsReducer + localStorage persistence
//
// Verifies that setTabList persists to localStorage, the store hydrates from
// a pre-seeded key on creation, and clearTabsStorage removes the key.
//
// localStorage key: `${Config.localStoragePrefix}tabsStateV${Config.localStorageVersion}`

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Config from '../../../config.ts';
import { configureStore } from '@reduxjs/toolkit';

import TabsReducer, { setTabList, clearTabsStorage } from '../../../redux/reducer/general/tabsReducer.ts';
import { TabAlignment } from '../../../types/general/tabType.ts';
import type { TabType } from '../../../types/general/tabType.ts';

const LS_KEY = `${Config.localStoragePrefix}tabsStateV${Config.localStorageVersion}`;

function createStore() {
  return configureStore({ reducer: { tabs: TabsReducer } });
}

const sampleTabs: TabType[] = [
  { selected: true, contentID: 1, displayName: 'Tab A', alignment: TabAlignment.top, position: 0 },
  { selected: false, contentID: 2, displayName: 'Tab B', alignment: TabAlignment.top, position: 1 },
];

describe('I4 — tabsReducer + localStorage persistence', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  // ── I4.1 — fresh store writes empty tabList to localStorage ───────────────

  it('I4.1 — fresh store writes empty tabList to localStorage', () => {
    createStore();
    const raw = localStorage.getItem(LS_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).tabList).toEqual([]);
  });

  // ── I4.2 — setTabList updates state and localStorage ─────────────────────

  it('I4.2 — setTabList updates state and persists to localStorage', () => {
    const store = createStore();
    store.dispatch(setTabList(sampleTabs));

    expect(store.getState().tabs.tabList).toHaveLength(2);
    const parsed = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(parsed.tabList).toHaveLength(2);
    expect(parsed.tabList[0].displayName).toBe('Tab A');
  });

  // ── I4.3 — store hydrates tabList from localStorage ──────────────────────

  it('I4.3 — store hydrates tabList from pre-seeded localStorage', () => {
    localStorage.setItem(LS_KEY, JSON.stringify({ tabList: sampleTabs }));
    const store = createStore();
    expect(store.getState().tabs.tabList).toHaveLength(2);
    expect(store.getState().tabs.tabList[1].displayName).toBe('Tab B');
  });

  // ── I4.4 — clearTabsStorage removes the localStorage key ─────────────────

  it('I4.4 — clearTabsStorage removes the localStorage key', () => {
    const store = createStore();
    expect(localStorage.getItem(LS_KEY)).not.toBeNull();

    store.dispatch(clearTabsStorage());
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });

  // ── I4.5 — second setTabList replaces first list entirely ─────────────────

  it('I4.5 — second setTabList replaces the previous list entirely', () => {
    const store = createStore();
    store.dispatch(setTabList(sampleTabs));

    const newTabs: TabType[] = [{ selected: true, contentID: 99, displayName: 'Only Tab', alignment: TabAlignment.left, position: 0 }];
    store.dispatch(setTabList(newTabs));

    expect(store.getState().tabs.tabList).toHaveLength(1);
    expect(store.getState().tabs.tabList[0].contentID).toBe(99);
  });
});
