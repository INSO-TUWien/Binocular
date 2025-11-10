import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

interface DateRange {
  from: string;
  to: string;
}

export interface IssuesState {
  issues: DataPluginIssue[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: IssuesState = {
  issues: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const burndownSlice = createSlice({
  name: 'burndown',
  initialState,
  reducers: {
    setIssues: (state, { payload: issues }: PayloadAction<IssuesState['issues']>) => {
      state.issues = issues;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setIssues, setDateRange, setDataState } = burndownSlice.actions;
export default burndownSlice.reducer;
