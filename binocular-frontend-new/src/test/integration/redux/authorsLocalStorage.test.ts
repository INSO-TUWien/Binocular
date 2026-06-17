// I14 — authorsReducer + localStorage
//
// Verifies that the authors reducer correctly manages author lists per
// data-plugin-id and persists state to/from localStorage.
//
// IMPORTANT: Do NOT dispatch editAuthor or saveAuthor — they call
// document.getElementById('editAuthorDialog').showModal() which crashes in jsdom.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Config from '../../../config.ts';
import { configureStore } from '@reduxjs/toolkit';

import AuthorsReducer, {
  setAuthorList,
  setAuthorsDataPluginId,
  switchAuthorSelection,
  checkAllAuthors,
  uncheckAllAuthors,
  clearAuthorsStorage,
} from '../../../redux/reducer/data/authorsReducer.ts';
import type { AuthorType } from '../../../types/data/authorType.ts';

const LS_KEY = `${Config.localStoragePrefix}authorsStateV${Config.localStorageVersion}`;
const PLUGIN_ID = 1;

function makeAuthor(userId: string, displayName: string): AuthorType {
  return {
    id: 0, // will be overwritten by reducer
    parent: -1,
    color: { main: '#aaaaaa', secondary: '#bbbbbb' },
    selected: false,
    displayName,
    user: {
      id: userId,
      gitSignature: `${displayName} <${displayName.toLowerCase()}@example.com>`,
      account: null,
    },
  };
}

function createStore() {
  return configureStore({ reducer: { authors: AuthorsReducer } });
}

describe('I14 — authorsReducer + localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── I14.1 — fresh store writes initial state ──────────────────────────────

  it('I14.1 — fresh store writes initial state to localStorage', () => {
    createStore();
    const raw = localStorage.getItem(LS_KEY);
    expect(raw).not.toBeNull();
    const state = JSON.parse(raw!);
    expect(state.authorLists).toBeDefined();
  });

  // ── I14.2 — setAuthorList stores list and persists ────────────────────────

  it('I14.2 — setAuthorList stores list under dataPluginId and persists', () => {
    const store = createStore();
    const authors = [makeAuthor('u1', 'Alice'), makeAuthor('u2', 'Bob')];

    store.dispatch(setAuthorList({ dataPluginId: PLUGIN_ID, authors }));

    const list = store.getState().authors.authorLists[PLUGIN_ID];
    expect(list).toHaveLength(2);

    const saved = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(saved.authorLists[PLUGIN_ID]).toHaveLength(2);
  });

  // ── I14.3 — switchAuthorSelection toggles selected ───────────────────────

  it('I14.3 — switchAuthorSelection toggles selected for the matching author', () => {
    const store = createStore();
    const authors = [makeAuthor('u1', 'Alice')];

    store.dispatch(setAuthorList({ dataPluginId: PLUGIN_ID, authors }));
    store.dispatch(setAuthorsDataPluginId(PLUGIN_ID));

    const authorId = store.getState().authors.authorLists[PLUGIN_ID][0].id;
    expect(store.getState().authors.authorLists[PLUGIN_ID][0].selected).toBe(false);

    store.dispatch(switchAuthorSelection(authorId));
    expect(store.getState().authors.authorLists[PLUGIN_ID][0].selected).toBe(true);
  });

  // ── I14.4 — checkAllAuthors sets all selected: true ──────────────────────

  it('I14.4 — checkAllAuthors sets all authors selected: true', () => {
    const store = createStore();
    const authors = [makeAuthor('u1', 'Alice'), makeAuthor('u2', 'Bob')];

    store.dispatch(setAuthorList({ dataPluginId: PLUGIN_ID, authors }));
    store.dispatch(setAuthorsDataPluginId(PLUGIN_ID));
    store.dispatch(checkAllAuthors());

    for (const author of store.getState().authors.authorLists[PLUGIN_ID]) {
      expect(author.selected).toBe(true);
    }
  });

  // ── I14.5 — uncheckAllAuthors sets all selected: false ───────────────────

  it('I14.5 — uncheckAllAuthors sets all authors selected: false', () => {
    const store = createStore();
    const authors = [makeAuthor('u1', 'Alice'), makeAuthor('u2', 'Bob')];

    store.dispatch(setAuthorList({ dataPluginId: PLUGIN_ID, authors }));
    store.dispatch(setAuthorsDataPluginId(PLUGIN_ID));
    store.dispatch(checkAllAuthors()); // first set all true
    store.dispatch(uncheckAllAuthors());

    for (const author of store.getState().authors.authorLists[PLUGIN_ID]) {
      expect(author.selected).toBe(false);
    }
  });

  // ── I14.6 — clearAuthorsStorage removes localStorage key ─────────────────

  it('I14.6 — clearAuthorsStorage removes the localStorage key', () => {
    const store = createStore();
    expect(localStorage.getItem(LS_KEY)).not.toBeNull();

    store.dispatch(clearAuthorsStorage());
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });
});
