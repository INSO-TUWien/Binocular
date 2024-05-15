import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Author {
  name: string;
  id: number;
  parent: number;
  color: string;
}

export interface AuthorsInitialState {
  authorList: Author[];
  dragging: boolean;
}

const initialState: AuthorsInitialState = {
  authorList: [
    { name: 'Author 1', id: 1, parent: -1, color: '#ffcc00' },
    { name: 'Author 2', id: 2, parent: -1, color: '#5856d6' },
    { name: 'Author 3', id: 3, parent: -1, color: '#4cd964' },
    { name: 'Author 4', id: 4, parent: -1, color: '#ff2d55' },
    { name: 'Author 5', id: 5, parent: -1, color: '#5ac8fa' },
  ],
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
