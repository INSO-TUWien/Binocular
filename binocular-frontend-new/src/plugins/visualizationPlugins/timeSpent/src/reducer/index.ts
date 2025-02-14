import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataPluginTimeSpent } from '../../../../interfaces/dataPluginInterfaces/dataPluginTimeSpent.ts';

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
  timeSpentEntries: DataPluginTimeSpent[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: TimeSpentState = {
  timeSpentEntries: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const changesSlice = createSlice({
  name: 'timeSpentEntries',
  initialState,
  reducers: {
    setTimeSpent: (state, action: PayloadAction<DataPluginTimeSpent[]>) => {
      state.timeSpentEntries = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setTimeSpent, setDateRange, setDataState } = changesSlice.actions;
export default changesSlice.reducer;
