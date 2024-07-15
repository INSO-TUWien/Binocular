import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthorType } from '../../types/data/authorType.ts';

export interface AuthorsInitialState {
  authorList: AuthorType[];
  dragging: boolean;
}

const initialState: AuthorsInitialState = {
  authorList: [],
  dragging: false,
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
  },
});

export const { setAuthorList, setDragging } = authorsSlice.actions;
export default authorsSlice.reducer;
