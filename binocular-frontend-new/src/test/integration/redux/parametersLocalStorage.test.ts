// I11 — parametersReducer + localStorage
//
// Verifies that the parameters reducer correctly reads and writes
// from/to localStorage using the key `parametersStateV1`.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import ParametersReducer, {
  setParametersGeneral,
  setParametersDateRange,
  clearParametersStorage,
  importParametersStorage,
} from '../../../redux/reducer/parameters/parametersReducer.ts';

const LS_KEY = 'bino_parametersStateV1';
const FROM = '2024-01-01T00:00:00.000Z';
const TO = '2024-12-31T23:59:59.000Z';

function createStore() {
  return configureStore({ reducer: { parameters: ParametersReducer } });
}

describe('I11 — parametersReducer + localStorage (I11.1–I11.7)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── I11.1 — fresh store writes initial state ──────────────────────────────

  it('I11.1 — fresh store writes initial state to localStorage', () => {
    createStore();
    const raw = localStorage.getItem(LS_KEY);
    expect(raw).not.toBeNull();
    const state = JSON.parse(raw!);
    expect(state.parametersGeneral.granularity).toBe('weeks');
    expect(state.parametersGeneral.excludeMergeCommits).toBe(false);
  });

  // ── I11.2 — store hydrates from pre-seeded localStorage ──────────────────

  it('I11.2 — store hydrates state from pre-seeded localStorage', () => {
    const seeded = {
      parametersGeneral: { granularity: 'days', excludeMergeCommits: true },
      parametersDateRange: { from: FROM, to: TO },
    };
    localStorage.setItem(LS_KEY, JSON.stringify(seeded));

    const store = createStore();
    expect(store.getState().parameters.parametersGeneral.granularity).toBe('days');
    expect(store.getState().parameters.parametersGeneral.excludeMergeCommits).toBe(true);
  });

  // ── I11.3 — setParametersGeneral updates state and persists ──────────────

  it('I11.3 — setParametersGeneral updates state and persists to localStorage', () => {
    const store = createStore();
    store.dispatch(setParametersGeneral({ granularity: 'days', excludeMergeCommits: false }));

    expect(store.getState().parameters.parametersGeneral.granularity).toBe('days');

    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.parametersGeneral.granularity).toBe('days');
  });

  // ── I11.4 — setParametersDateRange updates state and persists ─────────────

  it('I11.4 — setParametersDateRange updates state and persists to localStorage', () => {
    const store = createStore();
    store.dispatch(setParametersDateRange({ from: FROM, to: TO }));

    expect(store.getState().parameters.parametersDateRange.from).toBe(FROM);
    expect(store.getState().parameters.parametersDateRange.to).toBe(TO);

    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.parametersDateRange.from).toBe(FROM);
  });

  // ── I11.5 — clearParametersStorage removes the localStorage key ──────────

  it('I11.5 — clearParametersStorage removes the localStorage key', () => {
    const store = createStore();
    expect(localStorage.getItem(LS_KEY)).not.toBeNull();

    store.dispatch(clearParametersStorage());
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });

  // ── I11.6 — importParametersStorage writes payload to localStorage ────────

  it('I11.6 — importParametersStorage writes payload to localStorage', () => {
    const store = createStore();
    const imported = {
      parametersGeneral: { granularity: 'days', excludeMergeCommits: true },
      parametersDateRange: { from: '2023-01-01T00:00:00', to: '2023-12-31T00:00:00' },
    };
    store.dispatch(importParametersStorage(imported));
    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.parametersGeneral.granularity).toBe('days');
  });

  // ── I11.7 — importParametersStorage does NOT update Redux state ───────────

  it('I11.7 — importParametersStorage does NOT update Redux state (Immer no-op)', () => {
    const store = createStore();
    const original = store.getState().parameters.parametersGeneral.granularity;
    store.dispatch(
      importParametersStorage({
        parametersGeneral: { granularity: 'days', excludeMergeCommits: true },
        parametersDateRange: { from: '2023-01-01T00:00:00', to: '2023-12-31T00:00:00' },
      }),
    );
    // State is unchanged because Immer ignores direct state reassignment
    expect(store.getState().parameters.parametersGeneral.granularity).toBe(original);
  });
});
