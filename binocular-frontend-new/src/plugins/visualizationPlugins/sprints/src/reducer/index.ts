import { createSlice } from '@reduxjs/toolkit';

export interface SprintsState {}

const initialState: SprintsState = {};

export const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {},
});

export const {} = issuesSlice.actions;
export default issuesSlice.reducer;
