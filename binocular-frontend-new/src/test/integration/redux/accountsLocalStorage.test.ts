// I15 — accountsReducer + localStorage
//
// Verifies that the accounts reducer correctly manages account lists per
// data-plugin-id and persists state to/from localStorage.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import AccountsReducer, { setAccountList, clearAccountsStorage } from '../../../redux/reducer/data/accountsReducer.ts';
import type { AccountType } from '../../../types/data/accountType.ts';

const LS_KEY = 'bino_accountsStateV1';
const PLUGIN_ID = 1;

function makeAccount(id: string, name: string): AccountType {
  return {
    localId: 0,
    id,
    name,
    user: null,
    platform: 'github',
  };
}

function createStore() {
  return configureStore({ reducer: { accounts: AccountsReducer } });
}

describe('I15 — accountsReducer + localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── I15.1 — fresh store writes initial state ──────────────────────────────

  it('I15.1 — fresh store writes initial state to localStorage', () => {
    createStore();
    const raw = localStorage.getItem(LS_KEY);
    expect(raw).not.toBeNull();
    const state = JSON.parse(raw!);
    expect(state.accountLists).toBeDefined();
  });

  // ── I15.2 — setAccountList stores list and persists ──────────────────────

  it('I15.2 — setAccountList stores list under dataPluginId and persists', () => {
    const store = createStore();
    const accounts = [makeAccount('a1', 'Alice'), makeAccount('a2', 'Bob')];

    store.dispatch(setAccountList({ dataPluginId: PLUGIN_ID, accounts }));

    const list = store.getState().accounts.accountLists[PLUGIN_ID];
    expect(list).toHaveLength(2);

    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.accountLists[PLUGIN_ID]).toHaveLength(2);
  });

  // ── I15.3 — second setAccountList replaces previous list ─────────────────

  it('I15.3 — second setAccountList for same pluginId replaces the previous list', () => {
    const store = createStore();

    store.dispatch(setAccountList({ dataPluginId: PLUGIN_ID, accounts: [makeAccount('a1', 'Alice')] }));
    store.dispatch(setAccountList({ dataPluginId: PLUGIN_ID, accounts: [makeAccount('a2', 'Bob'), makeAccount('a3', 'Carol')] }));

    const list = store.getState().accounts.accountLists[PLUGIN_ID];
    expect(list).toHaveLength(2);
    const names = list.map((a: AccountType) => a.name);
    expect(names).toContain('Bob');
    expect(names).toContain('Carol');
    expect(names).not.toContain('Alice');
  });

  // ── I15.4 — clearAccountsStorage removes localStorage key ────────────────

  it('I15.4 — clearAccountsStorage removes the localStorage key', () => {
    const store = createStore();
    expect(localStorage.getItem(LS_KEY)).not.toBeNull();

    store.dispatch(clearAccountsStorage());
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });
});
