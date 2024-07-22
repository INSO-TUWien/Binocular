import { createSlice } from '@reduxjs/toolkit';

export interface ReducersState {
  test: boolean;
}

const initialState: ReducersState = {
  test: false,
};

export const reducerSlice = createSlice({
  name: 'reducer',
  initialState,
  reducers: {},
});

export const {} = reducerSlice.actions;
export default reducerSlice.reducer;
