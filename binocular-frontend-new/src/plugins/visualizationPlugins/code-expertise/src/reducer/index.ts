import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataPluginCommitBuild, DataPluginOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export interface ExpertiseData {
  ownershipData: DataPluginOwnership[];
  buildsData: DataPluginCommitBuild[];
}

export interface State {
  data: ExpertiseData[];
  branch?: number;
  dataState: DataState;
}

const initialState: State = {
  data: [],
  branch: undefined,
  dataState: DataState.EMPTY,
};

export const dataSlice = createSlice({
  name: 'code-expertise',
  initialState,
  reducers: {
    setData: (state: State, action: PayloadAction<ExpertiseData[]>) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
