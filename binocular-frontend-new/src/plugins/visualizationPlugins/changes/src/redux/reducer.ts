import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChangesState {
  name: string;
}

const initialState: ChangesState = {
  name: 'test',
};

export const changesSlice = createSlice({
  name: 'changes',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      console.log(action);
      state.name = action.payload;
    },
  },
});

export const { setName } = changesSlice.actions;
export default changesSlice.reducer;
