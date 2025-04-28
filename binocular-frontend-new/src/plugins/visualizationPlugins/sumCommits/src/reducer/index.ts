import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

interface DateRange {
  from: string;
  to: string;
}

export interface SumCommitsState {
  commits: DataPluginCommit[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: SumCommitsState = {
  commits: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const sumCommitsSlice = createSlice({
  name: 'sumCommits',
  initialState,
  reducers: {
    setCommits: (state, action: PayloadAction<DataPluginCommit[]>) => {
      state.commits = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setCommits, setDateRange, setDataState } = sumCommitsSlice.actions;
export default sumCommitsSlice.reducer;
