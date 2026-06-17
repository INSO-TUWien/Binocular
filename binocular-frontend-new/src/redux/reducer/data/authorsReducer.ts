import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthorType } from '../../../types/data/authorType.ts';
import Config from '../../../config.ts';
import type { AccountType } from '../../../types/data/accountType.ts';
import { cloneDeep } from 'lodash';

export interface AuthorsInitialState {
  authorLists: { [id: number]: AuthorType[] };
  dragging: boolean;
  draggingSource: 'authors' | 'other' | null;
  authorToEdit: AuthorType | undefined;
  dataPluginId: number | undefined;
}

const initialState: AuthorsInitialState = {
  authorLists: {},
  dragging: false,
  draggingSource: null,
  authorToEdit: undefined,
  dataPluginId: undefined,
};

export const authorsSlice = createSlice({
  name: 'authors',
  initialState: () => {
    const storedState = localStorage.getItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(
        `${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`,
        JSON.stringify(initialState),
      );
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setAuthorList: (state, action: PayloadAction<{ dataPluginId: number; authors: AuthorType[] }>) => {
      let authorList = state.authorLists[action.payload.dataPluginId] || [];

      if (authorList.length !== action.payload.authors.length) {
        // remove old authors that are not in the new list
        authorList.forEach((author: AuthorType) => {
          if (!action.payload.authors.find((a: AuthorType) => a.user.id === author.user.id)) {
            authorList = authorList.filter((a: AuthorType) => a.user.id !== author.user.id);
          }
        });
        // add new authors that are not in the list
        action.payload.authors.forEach((author) => {
          if (!authorList.find((a: AuthorType) => a.user.id === author.user.id)) {
            const newAuthor = cloneDeep(author);
            newAuthor.id = authorList.length + 1;
            authorList.push(newAuthor);
          }
        });
      }
      state.authorLists[action.payload.dataPluginId] = authorList;
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.dragging = action.payload;
      if (!action.payload) state.draggingSource = null;
    },
    setDraggingSource: (state, action: PayloadAction<'authors' | 'other'>) => {
      state.draggingSource = action.payload;
    },
    moveAuthorToOther: (state, action: PayloadAction<number>) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.id === action.payload) {
          a.parent = 0;
        }
        return a;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    releaseAuthor: (state, action: PayloadAction<number>) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.id === action.payload) {
          a.parent = -1;
        }
        return a;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    resetAuthor: (state, action: PayloadAction<number>) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.parent === action.payload || a.id === action.payload) {
          a.parent = -1;
        }
        return a;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setParentAuthor: (state, action: PayloadAction<{ author: number; parent: number }>) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      if (action.payload.author !== action.payload.parent) {
        state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
          if (a.parent === action.payload.author || a.id === action.payload.author) {
            a.parent = action.payload.parent;
            a.selected = state.authorLists[state.dataPluginId].find((p: AuthorType) => a.parent === p.id)?.selected;
          }
          return a;
        });
        localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
      }
    },
    editAuthor: (state, action: PayloadAction<number>) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      (document.getElementById('editAuthorDialog') as HTMLDialogElement).showModal();
      state.authorToEdit = state.authorLists[state.dataPluginId].find((a: AuthorType) => a.id === action.payload);
    },
    saveAuthor: (state, action: PayloadAction<AuthorType>) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.id === action.payload.id) {
          return action.payload;
        }
        return a;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    switchAuthorSelection: (state, action: PayloadAction<number>) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.id === action.payload || a.parent === action.payload) {
          a.selected = !a.selected;
        }
        return a;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    switchAllAuthorSelection: (state) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        a.selected = !a.selected;
        return a;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    checkAllAuthors: (state) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        a.selected = true;
        return a;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    uncheckAllAuthors: (state) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        a.selected = false;
        return a;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setAuthorsDataPluginId: (state, action: PayloadAction<number | undefined>) => {
      state.dataPluginId = action.payload;
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearAuthorsStorage: () => {
      localStorage.removeItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`);
    },
    importAuthorsStorage: (state, action: PayloadAction<AuthorsInitialState>) => {
      state = action.payload;
      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    assignAccount: (state, action: PayloadAction<{ account: AccountType; author: number }>) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId]) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.id === action.payload.author && a.user.account !== undefined) {
          a.user.account = action.payload.account;
        }
        if (Number(a.user.account?.id) === Number(action.payload.account.id) && Number(a.id) !== Number(action.payload.author)) {
          a.user.account = null;
        }
        return a;
      });

      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    resetAccount: (state) => {
      if (state.dataPluginId === undefined || !state.authorLists[state.dataPluginId] || !state.authorToEdit) return;
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.id == state.authorToEdit.id) {
          a.user.account = null;
        }
        return a;
      });

      localStorage.setItem(`${Config.localStoragePrefix}${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});
/* TODO test before use
function updateAuthorStorage(account: DataPluginAccount) {
  //   correct dP
  DataPluginStorage.getDataPlugin(dP)
    .then((dataPlugin) => {
      if (dataPlugin) {
        dataPlugin.accounts
          .saveAccountUserRelation(account)
          .then(() => {
            console.log('Account relation saved successfully');
          })
          .catch((e) => console.log('Error loading Accounts from selected data source! ' + e));
      }
    })
    .catch((e) => console.log(e));
}
*/
export const {
  setAuthorList,
  setDragging,
  setDraggingSource,
  moveAuthorToOther,
  releaseAuthor,
  resetAuthor,
  setParentAuthor,
  editAuthor,
  saveAuthor,
  switchAuthorSelection,
  switchAllAuthorSelection,
  checkAllAuthors,
  uncheckAllAuthors,
  setAuthorsDataPluginId,
  clearAuthorsStorage,
  importAuthorsStorage,
  assignAccount,
  resetAccount,
} = authorsSlice.actions;
export default authorsSlice.reducer;
