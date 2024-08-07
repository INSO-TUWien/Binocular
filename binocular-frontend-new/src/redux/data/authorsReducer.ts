import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthorType } from '../../types/data/authorType.ts';
import Config from '../../config.ts';

export interface AuthorsInitialState {
  authorList: AuthorType[];
  dragging: boolean;
  authorToEdit: AuthorType | undefined;
}

const initialState: AuthorsInitialState = {
  authorList: [],
  dragging: false,
  authorToEdit: undefined,
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
    setAuthorList: (state, action: PayloadAction<AuthorType[]>) => {
      if (state.authorList.length !== action.payload.length) {
        action.payload.forEach((author) => {
          if (!state.authorList.find((a: AuthorType) => a.user.id === author.user.id)) {
            author.id = state.authorList.length + 1;
            state.authorList.push(author);
          }
        });
      }
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.dragging = action.payload;
    },
    moveAuthorToOther: (state, action: PayloadAction<number>) => {
      state.authorList = state.authorList.map((a: AuthorType) => {
        if (a.parent === action.payload || a.id === action.payload) {
          a.parent = 0;
        }
        return a;
      });
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    resetAuthor: (state, action: PayloadAction<number>) => {
      state.authorList = state.authorList.map((a: AuthorType) => {
        if (a.parent === action.payload || a.id === action.payload) {
          a.parent = -1;
        }
        return a;
      });
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setParentAuthor: (state, action: PayloadAction<{ author: number; parent: number }>) => {
      if (action.payload.author !== action.payload.parent) {
        state.authorList = state.authorList.map((a: AuthorType) => {
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
      state.authorList = state.authorList.map((a: AuthorType) => {
        if (a.id === action.payload.id) {
          return action.payload;
        }
        return a;
      });
      localStorage.setItem(`${authorsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    switchAuthorSelection: (state, action: PayloadAction<number>) => {
      state.authorList = state.authorList.map((a: AuthorType) => {
        if (a.id === action.payload) {
          a.selected = !a.selected;
        }
        return a;
      });
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
  clearAuthorsStorage,
  importAuthorsStorage,
} = authorsSlice.actions;
export default authorsSlice.reducer;
