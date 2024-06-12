import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Author } from '../types/authorType.ts';

export interface AuthorsInitialState {
  authorList: Author[];
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
    setAuthorList: (state, action: PayloadAction<Author[]>) => {
      state.authorList = action.payload;
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.dragging = action.payload;
    },
  },
});

export const { setAuthorList, setDragging } = authorsSlice.actions;
export default authorsSlice.reducer;
