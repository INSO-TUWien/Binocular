// I16 — sprintsReducer + localStorage
//
// Verifies that the sprints reducer correctly manages sprint entries and
// persists state to/from localStorage.
//
// IMPORTANT: Do NOT dispatch sprintToEdit or saveSprint — they call
// document.getElementById('addSprintDialog').showModal() which crashes in jsdom.
//
// SprintType uses startDate/endDate (NOT from/to).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Config from '../../../config.ts';
import { configureStore } from '@reduxjs/toolkit';

import SprintsReducer, { addSprint, deleteSprint, clearSprintStorage } from '../../../redux/reducer/data/sprintsReducer.ts';
import type { SprintType } from '../../../types/data/sprintType.ts';

const LS_KEY = `${Config.localStoragePrefix}sprintsStateV${Config.localStorageVersion}`;

const sampleSprint: SprintType = {
  name: 'Sprint 1',
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-01-14T23:59:59.000Z',
};

function createStore() {
  return configureStore({ reducer: { sprints: SprintsReducer } });
}

describe('I16 — sprintsReducer + localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── I16.1 — fresh store writes initial state ──────────────────────────────

  it('I16.1 — fresh store writes { sprintList: [], currID: 0 } to localStorage', () => {
    createStore();
    const raw = localStorage.getItem(LS_KEY);
    expect(raw).not.toBeNull();
    const state = JSON.parse(raw!);
    expect(state.sprintList).toEqual([]);
    expect(state.currID).toBe(0);
  });

  // ── I16.2 — addSprint assigns auto-incremented id and persists ────────────

  it('I16.2 — addSprint assigns auto-incremented id and persists', () => {
    const store = createStore();
    store.dispatch(addSprint(sampleSprint));

    const { sprintList, currID } = store.getState().sprints;
    expect(sprintList).toHaveLength(1);
    expect(sprintList[0].id).toBe(0); // first id = currID before increment = 0
    expect(currID).toBe(1);

    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.sprintList).toHaveLength(1);
  });

  // ── I16.3 — two addSprint calls give distinct IDs ─────────────────────────

  it('I16.3 — two addSprint calls assign distinct IDs', () => {
    const store = createStore();
    store.dispatch(addSprint({ ...sampleSprint, name: 'Sprint A' }));
    store.dispatch(addSprint({ ...sampleSprint, name: 'Sprint B' }));

    const { sprintList } = store.getState().sprints;
    expect(sprintList).toHaveLength(2);
    expect(sprintList[0].id).not.toBe(sprintList[1].id);
  });

  // ── I16.4 — deleteSprint removes the sprint and persists ─────────────────

  it('I16.4 — deleteSprint removes the sprint and persists', () => {
    const store = createStore();
    store.dispatch(addSprint(sampleSprint));

    const sprint = store.getState().sprints.sprintList[0];
    store.dispatch(deleteSprint(sprint));

    expect(store.getState().sprints.sprintList).toHaveLength(0);
    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.sprintList).toHaveLength(0);
  });

  // ── I16.5 — clearSprintStorage removes localStorage key ──────────────────

  it('I16.5 — clearSprintStorage removes the localStorage key', () => {
    const store = createStore();
    expect(localStorage.getItem(LS_KEY)).not.toBeNull();

    store.dispatch(clearSprintStorage());
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });
});
