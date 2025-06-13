import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataPluginOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { PreviousFileData } from '../../../../../types/data/ownershipType.ts';
import { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export interface CodeOwnershipData {
  rawData?: DataPluginOwnership[];
  previousFilenames?: { [p: string]: PreviousFileData[] };
}

export interface CodeOwnershipState {
  data?: CodeOwnershipData;
  branch?: number;
  allBranches: DataPluginBranch[];
  dataState: DataState;
}

const initialState: CodeOwnershipState = {
  data: { rawData: undefined, previousFilenames: {} },
  branch: undefined,
  allBranches: [],
  dataState: DataState.EMPTY,
};

export const dataSlice = createSlice({
  name: 'codeOwnership',
  initialState,
  reducers: {
    setData: (state: CodeOwnershipState, action: PayloadAction<CodeOwnershipData>) => {
      state.data = action.payload;
    },
    setDataState: (state: CodeOwnershipState, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
    setCurrentBranch: (state: CodeOwnershipState, action: PayloadAction<number | undefined>) => {
      state.branch = action.payload;
    },
  },
});

export const { setData, setDataState, setCurrentBranch } = dataSlice.actions;
export default dataSlice.reducer;
