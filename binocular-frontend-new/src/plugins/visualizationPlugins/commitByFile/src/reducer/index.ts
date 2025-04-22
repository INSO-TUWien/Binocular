import { DataPluginCommitFileChanges } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsFilesChanges.ts';
import { createSlice } from '@reduxjs/toolkit';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export interface CommitByFileState {
  commitFiles: DataPluginCommitFileChanges[];
  sha: string;
  dataState: DataState;
}

const initialState: CommitByFileState = {
  commitFiles: [],
  sha: '',
  dataState: DataState.EMPTY,
};

export const commitByFileSlice = createSlice({
  name: 'commitByFile',
  initialState,
  reducers: {
    setCommitFiles: (state, action: { payload: DataPluginCommitFileChanges[] }) => {
      state.commitFiles = action.payload;
    },
    setSha: (state, action: { payload: string }) => {
      state.sha = action.payload;
    },
    setDataState: (state, action: { payload: DataState }) => {
      state.dataState = action.payload;
    },
  },
});

export const { setCommitFiles, setSha, setDataState } = commitByFileSlice.actions;
export default commitByFileSlice.reducer;
