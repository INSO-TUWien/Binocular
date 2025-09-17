import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';

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
  mergeRequests: DataPluginMergeRequest[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: IssuesState = {
  issues: [],
  mergeRequests: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const issuesSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {
    setIssues: (
      state,
      {
        payload: { issues, mergeRequests },
      }: PayloadAction<Pick<IssuesState, 'issues' | 'mergeRequests'>>,
    ) => {
      state.issues = issues;
      state.mergeRequests = mergeRequests;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setIssues, setDateRange, setDataState } = issuesSlice.actions;
export default issuesSlice.reducer;
