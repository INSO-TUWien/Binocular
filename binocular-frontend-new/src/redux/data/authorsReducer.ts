import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthorType } from '../../types/data/authorType.ts';

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
  initialState,
  reducers: {
    setAuthorList: (state, action: PayloadAction<AuthorType[]>) => {
      state.authorList = action.payload;
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.dragging = action.payload;
    },
    moveAuthorToOther: (state, action: PayloadAction<number>) => {
      state.authorList = state.authorList.map((a) => {
        if (a.parent === action.payload) {
          return { name: a.name, id: a.id, color: a.color, parent: 0, selected: a.selected };
        }
        if (a.id === action.payload) {
          return { name: a.name, id: a.id, color: a.color, parent: 0, selected: a.selected };
        }
        return a;
      });
    },
    resetAuthor: (state, action: PayloadAction<number>) => {
      state.authorList = state.authorList.map((a) => {
        if (a.parent === action.payload) {
          return { name: a.name, id: a.id, color: a.color, parent: -1, selected: a.selected };
        }
        if (a.id === action.payload) {
          return { name: a.name, id: a.id, color: a.color, parent: -1, selected: a.selected };
        }
        return a;
      });
    },
    editAuthor: (state, action: PayloadAction<number>) => {
      (document.getElementById('editAuthorDialog') as HTMLDialogElement).showModal();
      state.authorToEdit = state.authorList.find((a: AuthorType) => a.id === action.payload);
    },
    saveAuthor: (state, action: PayloadAction<AuthorType>) => {
      state.authorList = state.authorList.map((a) => {
        if (a.id === action.payload.id) {
          return action.payload;
        }
        return a;
      });
    },
    switchAuthorSelection: (state, action: PayloadAction<number>) => {
      state.authorList = state.authorList.map((a) => {
        if (a.id === action.payload) {
          a.selected = !a.selected;
        }
        return a;
      });
    },
  },
});

export const { setAuthorList, setDragging, moveAuthorToOther, resetAuthor, editAuthor, saveAuthor, switchAuthorSelection } =
  authorsSlice.actions;
export default authorsSlice.reducer;
