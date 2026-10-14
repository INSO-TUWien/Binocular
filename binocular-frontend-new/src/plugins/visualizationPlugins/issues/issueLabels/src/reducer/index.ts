import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DataPluginIssue } from '../../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

interface DateRange {
  from: string;
  to: string;
}

export interface IssueLabelsState {
  issues: DataPluginIssue[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: IssueLabelsState = {
  issues: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const issueLabelsSlice = createSlice({
  name: 'issueLabels',
  initialState,
  reducers: {
    setIssues: (state, action: PayloadAction<IssueLabelsState['issues']>) => {
      state.issues = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setIssues, setDateRange, setDataState } = issueLabelsSlice.actions;
export default issueLabelsSlice.reducer;
