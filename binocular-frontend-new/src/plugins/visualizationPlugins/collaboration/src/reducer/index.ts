import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ReducersState {
  test: boolean;
}

const initialState: ReducersState = {
  test: false,
};

export const reducerSlice = createSlice({
  name: 'reducer',
  initialState,
  reducers: {
    setTest: (state, action: PayloadAction<boolean>) => {
      state.test = action.payload;
    },
  },
});

export const { setTest } = reducerSlice.actions;
export default reducerSlice.reducer;
