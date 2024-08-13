import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthorType } from '../../types/data/authorType.ts';
import Config from '../../config.ts';

export interface AuthorsInitialState {
  authorLists: { [signature: string]: AuthorType[] };
  dragging: boolean;
  authorToEdit: AuthorType | undefined;
  dataPluginId: number | undefined;
}

const initialState: AuthorsInitialState = {
  authorLists: {},
  dragging: false,
  authorToEdit: undefined,
  dataPluginId: undefined,
};

export const authorsSlice = createSlice({
  name: 'authors',
  initialState: () => {
    const storedState = localStorage.getItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setAuthorList: (state, action: PayloadAction<{ dataPluginId: number; authors: AuthorType[] }>) => {
      let authorList = state.authorLists[action.payload.dataPluginId] || [];

      if (authorList.length !== action.payload.authors.length) {
        authorList.forEach((author: AuthorType) => {
          if (!action.payload.authors.find((a: AuthorType) => a.user.id === author.user.id)) {
            authorList = authorList.filter((a: AuthorType) => a.user.id !== author.user.id);
          }
        });
        action.payload.authors.forEach((author) => {
          if (!authorList.find((a: AuthorType) => a.user.id === author.user.id)) {
            author.id = authorList.length + 1;
            authorList.push(author);
          }
        });
      }
      state.authorLists[action.payload.dataPluginId] = authorList;
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.dragging = action.payload;
    },
    moveAuthorToOther: (state, action: PayloadAction<number>) => {
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.parent === action.payload || a.id === action.payload) {
          a.parent = 0;
        }
        return a;
      });
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    resetAuthor: (state, action: PayloadAction<number>) => {
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.parent === action.payload || a.id === action.payload) {
          a.parent = -1;
        }
        return a;
      });
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setParentAuthor: (state, action: PayloadAction<{ author: number; parent: number }>) => {
      if (action.payload.author !== action.payload.parent) {
        state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
          if (a.parent === action.payload.author || a.id === action.payload.author) {
            a.parent = action.payload.parent;
          }
          return a;
        });
        localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
      }
    },
    editAuthor: (state, action: PayloadAction<number>) => {
      (document.getElementById('editAuthorDialog') as HTMLDialogElement).showModal();
      state.authorToEdit = state.authorList.find((a: AuthorType) => a.id === action.payload);
    },
    saveAuthor: (state, action: PayloadAction<AuthorType>) => {
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.id === action.payload.id) {
          return action.payload;
        }
        return a;
      });
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    switchAuthorSelection: (state, action: PayloadAction<number>) => {
      state.authorLists[state.dataPluginId] = state.authorLists[state.dataPluginId].map((a: AuthorType) => {
        if (a.id === action.payload) {
          a.selected = !a.selected;
        }
        return a;
      });
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setAuthorsDataPluginId: (state, action: PayloadAction<number>) => {
      state.dataPluginId = action.payload;
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearAuthorsStorage: () => {
      localStorage.removeItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`);
    },
    importAuthorsStorage: (state, action: PayloadAction<AuthorsInitialState>) => {
      state = action.payload;
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const {
  setAuthorList,
  setDragging,
  moveAuthorToOther,
  resetAuthor,
  setParentAuthor,
  editAuthor,
  saveAuthor,
  switchAuthorSelection,
  setAuthorsDataPluginId,
  clearAuthorsStorage,
  importAuthorsStorage,
} = authorsSlice.actions;
export default authorsSlice.reducer;
