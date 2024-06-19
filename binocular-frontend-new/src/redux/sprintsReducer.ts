import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sprint } from '../types/sprintType.ts';

export interface SprintsInitialState {
  sprintList: Sprint[];
  currID: number;
}

const initialState: SprintsInitialState = {
  sprintList: [],
  currID: 0,
};

export const sprintsSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {
    setSprints: (state, action: PayloadAction<Sprint[]>) => {
      state.sprintList = action.payload;
    },
    addSprint: (state, action: PayloadAction<Sprint>) => {
      action.payload.id = state.currID;
      state.sprintList.push(action.payload);
      state.currID++;
    },
  },
});

export const { setSprints, addSprint } = sprintsSlice.actions;
export default sprintsSlice.reducer;
