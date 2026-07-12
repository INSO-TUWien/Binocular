import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DataPluginLizard } from '../../../../../interfaces/dataPluginInterfaces/dataPluginLizard.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export interface LizardState {
  lizardRows: DataPluginLizard[];
  dataState: DataState;
}

const initialState: LizardState = {
  lizardRows: [],
  dataState: DataState.EMPTY,
};

export const lizardSlice = createSlice({
  name: 'lizardFileAnalysis',
  initialState,
  reducers: {
    setLizardRows: (state, action: PayloadAction<DataPluginLizard[]>) => {
      state.lizardRows = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setLizardRows, setDataState } = lizardSlice.actions;
export default lizardSlice.reducer;
