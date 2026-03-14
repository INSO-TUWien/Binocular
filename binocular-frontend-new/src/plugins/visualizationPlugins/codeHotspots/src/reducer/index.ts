import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import type { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches';
import type { DataPluginFile } from '../../../../interfaces/dataPluginInterfaces/dataPluginFiles';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

interface DateRange {
  from: string;
  to: string;
}

export interface SelectedFile {
  path: string;
  url: string;
}

export interface CodeHotspotsState {
  commits: DataPluginCommit[];
  branches: DataPluginBranch[];
  files: DataPluginFile[];
  currentBranch: DataPluginBranch | undefined;
  dateRange: DateRange;
  dataState: DataState;
  selectedFile: SelectedFile | null;
}

const initialState: CodeHotspotsState = {
  commits: [],
  branches: [],
  files: [],
  currentBranch: undefined,
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
  selectedFile: null,
};

export const changesSlice = createSlice({
  name: 'changes',
  initialState,
  reducers: {
    setCommits: (state, action: PayloadAction<DataPluginCommit[]>) => {
      state.commits = action.payload;
    },
    setBranches: (state, action: PayloadAction<DataPluginBranch[]>) => {
      state.branches = action.payload;
      state.currentBranch = action.payload.find((branch) => branch.active === 'true');
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
    setFile: (state, action: PayloadAction<SelectedFile>) => {
      state.selectedFile = action.payload;
    },
  },
});

export const { setCommits, setBranches, setFiles, setDateRange, setDataState, setFile } = changesSlice.actions;
export default changesSlice.reducer;
