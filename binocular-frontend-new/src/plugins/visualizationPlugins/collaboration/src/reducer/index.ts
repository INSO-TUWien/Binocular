import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataPluginAccountIssues } from "../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts";

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
  accounts: DataPluginAccountIssues[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: CollaborationState = {
  accounts: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const collaborationSlice = createSlice({
  name: "collaboration",
  initialState,
  reducers: {
    /** Replace the entire accounts list */
    setAccounts: (state, action: PayloadAction<DataPluginAccountIssues[]>) => {
      state.accounts = action.payload;
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

export const { setAccounts, setDateRange, setDataState } =
  collaborationSlice.actions;
export default collaborationSlice.reducer;
