import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SprintType } from '../../../types/data/sprintType.ts';
import Config from '../../../config.ts';
import { cloneDeep } from 'lodash';

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
    const storedState = localStorage.getItem(`${Config.localStoragePrefix}${sprintsSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(
        `${Config.localStoragePrefix}${sprintsSlice.name}StateV${Config.localStorageVersion}`,
        JSON.stringify(initialState),
      );
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setSprints: (state, action: PayloadAction<SprintType[]>) => {
      state.sprintList = action.payload;
      localStorage.setItem(`${Config.localStoragePrefix}${sprintsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    addSprint: (state, action: PayloadAction<SprintType>) => {
      const newSprint = cloneDeep(action.payload);
      newSprint.id = state.currID;
      state.sprintList.push(newSprint);
      state.currID++;
      localStorage.setItem(`${Config.localStoragePrefix}${sprintsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    deleteSprint: (state, action: PayloadAction<SprintType>) => {
      state.sprintList = state.sprintList.filter((s: SprintType) => s.id !== action.payload.id);
      localStorage.setItem(`${Config.localStoragePrefix}${sprintsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
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
      localStorage.setItem(`${Config.localStoragePrefix}${sprintsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearSprintStorage: () => {
      localStorage.removeItem(`${Config.localStoragePrefix}${sprintsSlice.name}StateV${Config.localStorageVersion}`);
    },
    importSprintStorage: (state, action: PayloadAction<SprintsInitialState>) => {
      state = action.payload;
      localStorage.setItem(`${Config.localStoragePrefix}${sprintsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setSprints, addSprint, deleteSprint, sprintToEdit, saveSprint, clearSprintStorage, importSprintStorage } =
  sprintsSlice.actions;
export default sprintsSlice.reducer;
