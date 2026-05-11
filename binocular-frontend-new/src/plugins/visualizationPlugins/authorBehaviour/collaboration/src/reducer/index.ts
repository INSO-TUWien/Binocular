import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DataPluginAccountIssues } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts';
import type { DataPluginAccountMergeRequests } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';
import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export type DateRange = {
  from: string;
  to: string;
};

/**
 * Redux state for collaboration visualization
 */
export interface CollaborationState {
  issueAccounts: DataPluginAccountIssues[];
  mrAccounts: DataPluginAccountMergeRequests[];
  commits: DataPluginCommit[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: CollaborationState = {
  issueAccounts: [],
  mrAccounts: [],
  commits: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    /** Replace the issue - accounts list */
    setIssueAccounts: (state, action: PayloadAction<DataPluginAccountIssues[]>) => {
      state.issueAccounts = action.payload;
    },
    /** Replace the merge request - accounts list */
    setMrAccounts: (state, action: PayloadAction<DataPluginAccountMergeRequests[]>) => {
      state.mrAccounts = action.payload;
    },
    /** Replace the commits list */
    setCommits: (state, action: PayloadAction<DataPluginCommit[]>) => {
      state.commits = action.payload;
    },
    /** Update the date range for fetching data */
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    /** Set the current data loading status */
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setIssueAccounts, setMrAccounts, setCommits, setDateRange, setDataState } = collaborationSlice.actions;
export default collaborationSlice.reducer;
