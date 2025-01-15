import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataPluginFile } from "../../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts";
import { DataPluginCommit } from "../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts";

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

interface DateRange {
  from: string;
  to: string;
}

export interface ChangesState {
  current_file_commits: DataPluginCommit[];
  files: DataPluginFile[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: ChangesState = {
  current_file_commits : [],
  files: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const changesSlice = createSlice({
  name: "changes",
  initialState,
  reducers: {
    setCurrentFileCommits(state, action: PayloadAction<DataPluginCommit[]>) {
      state.current_file_commits = action.payload;
    },
    setFiles: (state, action: PayloadAction<DataPluginFile[]>) => {
      state.files = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setCurrentFileCommits, setFiles, setDateRange, setDataState } =
  changesSlice.actions;
export default changesSlice.reducer;
