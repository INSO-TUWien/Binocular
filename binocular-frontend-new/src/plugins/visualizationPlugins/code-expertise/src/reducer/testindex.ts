import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CodeExpertiseState {
  data: {
    data: any | null;
    isFetching: boolean;
    error: string | null;
  };
  config: {
    currentBranch: string | null;
    mode: 'modules' | 'issues';
    activeFiles: string[];
    activeIssueId: string | null;
    details: string | null;
    onlyDisplayOwnership: boolean;
  };
}

const initialState: CodeExpertiseState = {
  data: {
    data: null,
    isFetching: false,
    error: null,
  },
  config: {
    currentBranch: null,
    mode: 'modules',
    activeFiles: [],
    activeIssueId: null,
    details: null,
    onlyDisplayOwnership: false,
  },
};

const codeExpertiseSlice = createSlice({
  name: 'codeExpertise',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<any>) => {
      state.data.data = action.payload;
      state.data.isFetching = false;
      state.data.error = null;
    },
    setIsFetching: (state, action: PayloadAction<boolean>) => {
      state.data.isFetching = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.data.error = action.payload;
      state.data.isFetching = false;
    },
    setBranch: (state, action: PayloadAction<string | null>) => {
      state.config.currentBranch = action.payload;
    },
    setMode: (state, action: PayloadAction<'modules' | 'issues'>) => {
      state.config.mode = action.payload;
    },
    setActiveFiles: (state, action: PayloadAction<string[]>) => {
      state.config.activeFiles = action.payload;
    },
    setActiveIssueId: (state, action: PayloadAction<string | null>) => {
      state.config.activeIssueId = action.payload;
    },
    setDetails: (state, action: PayloadAction<string | null>) => {
      state.config.details = action.payload;
    },
    setOnlyDisplayOwnership: (state, action: PayloadAction<boolean>) => {
      state.config.onlyDisplayOwnership = action.payload;
    },
    requestRefresh: (state) => {
      state.data.isFetching = true;
    },
  },
});

export const {
  setData,
  setIsFetching,
  setError,
  setBranch,
  setMode,
  setActiveFiles,
  setActiveIssueId,
  setDetails,
  setOnlyDisplayOwnership,
  requestRefresh,
} = codeExpertiseSlice.actions;

export default codeExpertiseSlice.reducer;