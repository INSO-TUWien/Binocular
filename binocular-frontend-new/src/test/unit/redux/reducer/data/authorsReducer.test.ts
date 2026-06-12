import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, {
  setDragging,
  moveAuthorToOther,
  resetAuthor,
  setParentAuthor,
  checkAllAuthors,
  uncheckAllAuthors,
  switchAuthorSelection,
  clearAuthorsStorage,
} from '../../../../../redux/reducer/data/authorsReducer';
import type { AuthorsInitialState } from '../../../../../redux/reducer/data/authorsReducer';
import type { AuthorType } from '../../../../../types/data/authorType';

function makeAuthor(id: number, parent: number, selected = true): AuthorType {
  return {
    id,
    parent,
    selected,
    color: { main: '#ff0000', secondary: '#000000' },
    user: { id: `user-${id}`, gitSignature: `sig-${id}`, account: null },
  };
}

const author1 = makeAuthor(1, -1, true);
const author2 = makeAuthor(2, -1, false);

const emptyState: AuthorsInitialState = {
  authorLists: { 1: [author1, author2] },
  dragging: false,
  authorToEdit: undefined,
  dataPluginId: 1,
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('authorsReducer – setDragging', () => {
  it('U26.1 updates dragging flag', () => {
    const state = reducer(emptyState, setDragging(true));
    expect(state.dragging).toBe(true);
  });
});

describe('authorsReducer – moveAuthorToOther', () => {
  it('U26.2 sets parent = 0 for the target author', () => {
    const state = reducer(emptyState, moveAuthorToOther(1));
    const a = (state.authorLists[1] as AuthorType[]).find((a) => a.id === 1);
    expect(a?.parent).toBe(0);
  });

  it('U26.3 children of the target keep their parent reference', () => {
    const child = makeAuthor(3, 1);
    const stateWithChild: AuthorsInitialState = {
      ...emptyState,
      authorLists: { 1: [author1, author2, child] },
    };
    const state = reducer(stateWithChild, moveAuthorToOther(1));
    const c = (state.authorLists[1] as AuthorType[]).find((a) => a.id === 3);
    expect(c?.parent).toBe(1);
  });
});

describe('authorsReducer – resetAuthor', () => {
  it('U26.4 sets parent = -1 for the target author', () => {
    const stateWithParent: AuthorsInitialState = {
      ...emptyState,
      authorLists: { 1: [makeAuthor(1, 0), author2] },
    };
    const state = reducer(stateWithParent, resetAuthor(1));
    const a = (state.authorLists[1] as AuthorType[]).find((a) => a.id === 1);
    expect(a?.parent).toBe(-1);
  });
});

describe('authorsReducer – setParentAuthor', () => {
  it('U26.5 sets the parent relationship', () => {
    const state = reducer(emptyState, setParentAuthor({ author: 2, parent: 1 }));
    const a = (state.authorLists[1] as AuthorType[]).find((a) => a.id === 2);
    expect(a?.parent).toBe(1);
  });

  it('U26.6 ignores self-assignment (author === parent)', () => {
    const state = reducer(emptyState, setParentAuthor({ author: 1, parent: 1 }));
    const a = (state.authorLists[1] as AuthorType[]).find((a) => a.id === 1);
    expect(a?.parent).toBe(-1); // unchanged
  });
});

describe('authorsReducer – checkAllAuthors', () => {
  it('U26.7 sets all selected = true', () => {
    const state = reducer(emptyState, checkAllAuthors());
    const list = state.authorLists[1] as AuthorType[];
    expect(list.every((a) => a.selected === true)).toBe(true);
  });
});

describe('authorsReducer – uncheckAllAuthors', () => {
  it('U26.8 sets all selected = false', () => {
    const state = reducer(emptyState, uncheckAllAuthors());
    const list = state.authorLists[1] as AuthorType[];
    expect(list.every((a) => a.selected === false)).toBe(true);
  });
});

describe('authorsReducer – switchAuthorSelection', () => {
  it('U26.9 toggles selected on target and its children', () => {
    const child = makeAuthor(3, 1, true);
    const stateWithChild: AuthorsInitialState = {
      ...emptyState,
      authorLists: { 1: [makeAuthor(1, -1, true), author2, child] },
    };
    const state = reducer(stateWithChild, switchAuthorSelection(1));
    const list = state.authorLists[1] as AuthorType[];
    expect(list.find((a) => a.id === 1)?.selected).toBe(false);
    expect(list.find((a) => a.id === 3)?.selected).toBe(false);
    // author2 is unaffected
    expect(list.find((a) => a.id === 2)?.selected).toBe(false);
  });
});

describe('authorsReducer – clearAuthorsStorage', () => {
  it('U26.10 calls localStorage.removeItem', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem');
    reducer(emptyState, clearAuthorsStorage());
    expect(spy).toHaveBeenCalled();
  });
});

import { setAuthorList, switchAllAuthorSelection, assignAccount } from '../../../../../redux/reducer/data/authorsReducer';
import type { AccountType } from '../../../../../types/data/accountType';

function makeAccount(id: string): AccountType {
  return { localId: 0, id, name: `Account ${id}`, user: null, platform: 'github' };
}

function makeAuthorWithAccount(id: number, parent: number, account: AccountType | null): AuthorType {
  return {
    id,
    parent,
    selected: true,
    color: { main: '#ff0000', secondary: '#000000' },
    user: { id: `user-${id}`, gitSignature: `sig-${id}`, account },
  };
}

describe('authorsReducer – setParentAuthor (extended)', () => {
  it('U26.11 self-reference leaves parent unchanged', () => {
    // author1 has parent -1; dispatching setParentAuthor({ author: 1, parent: 1 }) is a no-op
    const state = reducer(emptyState, setParentAuthor({ author: 1, parent: 1 }));
    const a = (state.authorLists[1] as AuthorType[]).find((a) => a.id === 1);
    expect(a?.parent).toBe(-1);
  });
});

describe('authorsReducer – assignAccount (extended)', () => {
  it('U26.12 assigning account X to author B removes it from author A', () => {
    const account = makeAccount('1'); // numeric string so Number(id) comparison in reducer works
    const authorA = makeAuthorWithAccount(1, -1, account);
    const authorB = makeAuthorWithAccount(2, -1, null); // null !== undefined, so assignment triggers
    const stateWithAccounts: AuthorsInitialState = {
      ...emptyState,
      authorLists: { 1: [authorA, authorB] },
    };
    const state = reducer(stateWithAccounts, assignAccount({ account, author: 2 }));
    const list = state.authorLists[1] as AuthorType[];
    // author B now has the account
    expect(list.find((a) => a.id === 2)?.user.account?.id).toBe('1');
    // author A lost the account
    expect(list.find((a) => a.id === 1)?.user.account).toBeNull();
  });
});

describe('authorsReducer – setAuthorList (extended)', () => {
  it('U26.13 dispatching twice with identical data does not duplicate authors', () => {
    const authors = [
      { ...makeAuthor(1, -1), user: { id: 'user-1', gitSignature: 'sig-1', account: null } },
      { ...makeAuthor(2, -1), user: { id: 'user-2', gitSignature: 'sig-2', account: null } },
    ];
    const base: AuthorsInitialState = {
      authorLists: {},
      dragging: false,
      authorToEdit: undefined,
      dataPluginId: 1,
    };
    const state1 = reducer(base, setAuthorList({ dataPluginId: 1, authors }));
    const state2 = reducer(state1, setAuthorList({ dataPluginId: 1, authors }));
    expect((state2.authorLists[1] as AuthorType[]).length).toBe(2);
  });
});

describe('authorsReducer – switchAllAuthorSelection (extended)', () => {
  it('U26.14 all-unselected list → all become selected', () => {
    const allUnselected: AuthorsInitialState = {
      ...emptyState,
      authorLists: { 1: [makeAuthor(1, -1, false), makeAuthor(2, -1, false)] },
    };
    const state = reducer(allUnselected, switchAllAuthorSelection());
    const list = state.authorLists[1] as AuthorType[];
    expect(list.every((a) => a.selected === true)).toBe(true);
  });

  it('U26.15 all-selected list → all become unselected', () => {
    const allSelected: AuthorsInitialState = {
      ...emptyState,
      authorLists: { 1: [makeAuthor(1, -1, true), makeAuthor(2, -1, true)] },
    };
    const state = reducer(allSelected, switchAllAuthorSelection());
    const list = state.authorLists[1] as AuthorType[];
    expect(list.every((a) => a.selected === false)).toBe(true);
  });
});

describe('authorsReducer – moveAuthorToOther with children (extended)', () => {
  it('U26.16 author is moved (parent set to 0) and its children keep their parent reference', () => {
    const parent = makeAuthor(10, -1, true);
    const child1 = makeAuthor(11, 10, true);
    const child2 = makeAuthor(12, 10, true);
    const stateWithFamily: AuthorsInitialState = {
      ...emptyState,
      authorLists: { 1: [parent, child1, child2] },
    };
    const state = reducer(stateWithFamily, moveAuthorToOther(10));
    const list = state.authorLists[1] as AuthorType[];
    expect(list.find((a) => a.id === 10)?.parent).toBe(0);
    expect(list.find((a) => a.id === 11)?.parent).toBe(10);
    expect(list.find((a) => a.id === 12)?.parent).toBe(10);
  });
});
