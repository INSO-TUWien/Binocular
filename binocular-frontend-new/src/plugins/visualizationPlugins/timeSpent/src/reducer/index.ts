import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DataPluginNote } from '../../../../interfaces/dataPluginInterfaces/dataPluginNotes.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

interface DateRange {
  from: string;
  to: string;
}

export interface TimeSpentState {
  notes: DataPluginNote[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: TimeSpentState = {
  notes: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const timeSpentSlice = createSlice({
  name: 'timeSpent',
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<DataPluginNote[]>) => {
      state.notes = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setNotes, setDateRange, setDataState } = timeSpentSlice.actions;
export default timeSpentSlice.reducer;
