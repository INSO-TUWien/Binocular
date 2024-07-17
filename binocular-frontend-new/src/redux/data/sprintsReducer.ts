import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SprintType } from '../../types/data/sprintType.ts';
import Config from '../../config.ts';

export interface SprintsInitialState {
  sprintList: SprintType[];
  currID: number;
  sprintToEdit: SprintType | null;
}

const initialState: SprintsInitialState = {
  sprintList: [],
  currID: 0,
  sprintToEdit: null,
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
    deleteSprint: (state, action: PayloadAction<SprintType>) => {
      state.sprintList = state.sprintList.filter((s: SprintType) => s.id !== action.payload.id);
      localStorage.setItem(`sprintsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    sprintToEdit: (state, action: PayloadAction<SprintType | null>) => {
      state.sprintToEdit = action.payload;
      (document.getElementById('addSprintDialog') as HTMLDialogElement).showModal();
    },
    saveSprint: (state, action: PayloadAction<SprintType>) => {
      state.sprintToEdit = null;
      state.sprintList = state.sprintList.map((s: SprintType) => {
        if (s.id === action.payload.id) {
          return action.payload;
        }
        return s;
      });
      localStorage.setItem(`sprintsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setSprints, addSprint, deleteSprint, sprintToEdit, saveSprint } = sprintsSlice.actions;
export default sprintsSlice.reducer;
