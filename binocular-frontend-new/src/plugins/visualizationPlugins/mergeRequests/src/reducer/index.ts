import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
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

export interface MergeRequestsState {
  mergeRequests: DataPluginMergeRequest[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: MergeRequestsState = {
  mergeRequests: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const mergeRequestsSlice = createSlice({
  name: 'mergeRequests',
  initialState,
  reducers: {
    setMergeRequests: (state, action: PayloadAction<DataPluginMergeRequest[]>) => {
      state.mergeRequests = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setMergeRequests, setDateRange, setDataState } = mergeRequestsSlice.actions;
export default mergeRequestsSlice.reducer;
