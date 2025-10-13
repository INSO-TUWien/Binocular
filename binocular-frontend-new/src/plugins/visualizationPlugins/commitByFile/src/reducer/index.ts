import type { DataPluginCommitFile } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsFiles.ts';
import { createSlice } from '@reduxjs/toolkit';
import type { DataPluginCommitShort } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export interface CommitByFileState {
  commitFiles: DataPluginCommitFile[];
  commits: DataPluginCommitShort[];
  sha: string;
  dataState: DataState;
}

const initialState: CommitByFileState = {
  commitFiles: [],
  commits: [],
  sha: '',
  dataState: DataState.EMPTY,
};

export const commitByFileSlice = createSlice({
  name: 'commitByFile',
  initialState,
  reducers: {
    setCommitFiles: (state, action: { payload: DataPluginCommitFile[] }) => {
      state.commitFiles = action.payload;
    },
    setSha: (state, action: { payload: string }) => {
      state.sha = action.payload;
    },
    setDataState: (state, action: { payload: DataState }) => {
      state.dataState = action.payload;
    },
    setCommits: (state, action: { payload: DataPluginCommitShort[] }) => {
      state.commits = action.payload;
    },
  },
});

export const { setCommitFiles, setSha, setDataState, setCommits } = commitByFileSlice.actions;
export default commitByFileSlice.reducer;
