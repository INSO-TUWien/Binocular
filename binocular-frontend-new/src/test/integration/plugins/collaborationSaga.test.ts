// I20 — authorBehaviour/collaboration saga + MockData
//
// Mirrors the Changes saga flow (I6) wired to the collaboration visualization plugin.
// Trigger: setDateRange (takeEvery) — collaboration uses throttle(500) on REFRESH only.
//
// The collaboration saga selects via:
//   yield select((root: { plugin: CollaborationState }) => root.plugin)
// so the store must register the reducer under the key 'plugin'.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import MockData from '../../../plugins/dataPlugins/mockData/src/index.ts';
import collaborationReducer, {
  DataState,
  setDateRange,
} from '../../../plugins/visualizationPlugins/authorBehaviour/collaboration/src/reducer/index.ts';
import collaborationSaga from '../../../plugins/visualizationPlugins/authorBehaviour/collaboration/src/saga/index.ts';

const FROM = '2024-01-01T00:00:00.000Z';
const TO = '2024-12-31T23:59:59.000Z';

function createTestStore(plugin: MockData) {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: { plugin: collaborationReducer },
    middleware: (gDM) => gDM({ thunk: false, serializableCheck: false }).concat(sagaMiddleware),
  });
  sagaMiddleware.run(collaborationSaga, plugin);
  return store;
}

describe('I20 — collaboration saga + MockData', () => {
  let mockData: MockData;

  beforeEach(async () => {
    localStorage.clear();
    mockData = new MockData();
    await mockData.init();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ── I20.1 — fresh store has EMPTY dataState ───────────────────────────────

  it('I20.1 — fresh plugin store has dataState: EMPTY', () => {
    const store = createTestStore(mockData);
    expect(store.getState().plugin.dataState).toBe(DataState.EMPTY);
  });

  // ── I20.2 — dataState reaches COMPLETE after setDateRange ────────────────

  it('I20.2 — dataState reaches COMPLETE after setDateRange', async () => {
    const store = createTestStore(mockData);
    store.dispatch(setDateRange({ from: FROM, to: TO }));

    await vi.waitFor(() => expect(store.getState().plugin.dataState).toBe(DataState.COMPLETE), { timeout: 3000 });
  });

  // ── I20.3 — accounts array is non-empty after saga ───────────────────────

  it('I20.3 — accounts array is non-empty after saga completes', async () => {
    const store = createTestStore(mockData);
    store.dispatch(setDateRange({ from: FROM, to: TO }));

    await vi.waitFor(() => expect(store.getState().plugin.issueAccounts.length).toBeGreaterThan(0), { timeout: 3000 });
  });

  // ── I20.4 — each account has required fields ──────────────────────────────

  it('I20.4 — each account in state has id and issues fields', async () => {
    const store = createTestStore(mockData);
    store.dispatch(setDateRange({ from: FROM, to: TO }));

    await vi.waitFor(() => expect(store.getState().plugin.dataState).toBe(DataState.COMPLETE), { timeout: 3000 });

    for (const account of store.getState().plugin.issueAccounts) {
      expect(account).toHaveProperty('id');
      expect(account).toHaveProperty('issues');
    }
  });
});
