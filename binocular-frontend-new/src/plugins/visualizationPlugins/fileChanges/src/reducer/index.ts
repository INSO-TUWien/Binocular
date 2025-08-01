import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {DataPluginFile} from '../../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';
import type {DataPluginCommit} from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

interface DateRange {
  from: string;
  to: string;
}

export let files: DataPluginFile[] = [];
export let current_file: string = 'README.md';

export function setGlobalCurrentFileData(newCurrentFile: string) {
  console.log('Setting current file to', newCurrentFile);
  current_file = newCurrentFile;
  setCurrentFile(newCurrentFile);
}

export function setGlobalFiles(newFiles: DataPluginFile[]) {
  files = newFiles;
}

export interface ChangesState {
  current_file: string;
  last_current_file: string;
  current_file_commits: DataPluginCommit[];
  current_file_total_commits: DataPluginCommit[];
  files: DataPluginFile[];
  dateRange: DateRange;
  dataState: DataState;
  dateOfOverallFirstCommit: string;
  dateOfOverallLastCommit: string;
}

const initialState: ChangesState = {
  current_file: 'README.md',
  last_current_file: '',
  current_file_commits: [],
  current_file_total_commits: [],
  files: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
  dateOfOverallFirstCommit: '',
  dateOfOverallLastCommit: '',
};

export const changesSlice = createSlice({
  name: 'changes',
  initialState,
  reducers: {
    setCurrentFileCommits(state, action: PayloadAction<DataPluginCommit[]>) {
      state.current_file_commits = action.payload;
    },
    setCurrentFileTotalCommits(state, action: PayloadAction<DataPluginCommit[]>) {
      state.current_file_total_commits = action.payload;
    },
    setCurrentFile(state, action: PayloadAction<string>) {
      state.last_current_file = state.current_file;
      state.current_file = action.payload;
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
    setDateOfOverallFirstCommit: (state, action: PayloadAction<string>) => {
      state.dateOfOverallFirstCommit = action.payload;
    },
    setDateOfOverallLastCommit: (state, action: PayloadAction<string>) => {
      state.dateOfOverallLastCommit = action.payload;
    },
  },
});

export const {
  setCurrentFileCommits,
  setCurrentFileTotalCommits,
  setCurrentFile,
  setFiles,
  setDateRange,
  setDataState,
  setDateOfOverallFirstCommit,
  setDateOfOverallLastCommit,
} = changesSlice.actions;
export default changesSlice.reducer;
