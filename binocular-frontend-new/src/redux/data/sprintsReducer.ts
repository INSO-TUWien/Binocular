import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SprintType } from '../../types/data/sprintType.ts';
import Config from '../../config.ts';

export interface SprintsInitialState {
  sprintList: SprintType[];
  currID: number;
}

const initialState: SprintsInitialState = {
  sprintList: [],
  currID: 0,
};

export const sprintsSlice = createSlice({
  name: 'sprints',
  initialState: () => {
    const storedState = localStorage.getItem(`sprintsStateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`sprintsStateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setSprints: (state, action: PayloadAction<SprintType[]>) => {
      state.sprintList = action.payload;
      localStorage.setItem(`sprintsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    addSprint: (state, action: PayloadAction<SprintType>) => {
      action.payload.id = state.currID;
      state.sprintList.push(action.payload);
      state.currID++;
      localStorage.setItem(`sprintsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setSprints, addSprint } = sprintsSlice.actions;
export default sprintsSlice.reducer;
