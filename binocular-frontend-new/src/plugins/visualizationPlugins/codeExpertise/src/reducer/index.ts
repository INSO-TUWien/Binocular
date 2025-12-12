import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type DataPluginCommitBuild, type DataPluginOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { type PreviousFileData } from '../../../../../types/data/ownershipType.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export interface ExpertiseData {
  ownershipData: CodeOwnershipData;
  buildsData: DataPluginCommitBuild[];
}

interface CodeOwnershipData {
  rawData?: DataPluginOwnership[];
  previousFilenames?: { [p: string]: PreviousFileData[] };
}

export interface State {
  data: ExpertiseData;
  branch?: number;
  dataState: DataState;
}

const initialState: State = {
  data: {
    ownershipData: {},
    buildsData: [],
  },
  branch: undefined,
  dataState: DataState.EMPTY,
};

export const dataSlice = createSlice({
  name: 'codeExpertise',
  initialState,
  reducers: {
    setData: (state: State, action: PayloadAction<ExpertiseData>) => {
      state.data = action.payload;
    },
    setCurrentBranch: (state: State, action: PayloadAction<number | undefined>) => {
      state.branch = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setData, setCurrentBranch, setDataState } = dataSlice.actions;
export default dataSlice.reducer;
