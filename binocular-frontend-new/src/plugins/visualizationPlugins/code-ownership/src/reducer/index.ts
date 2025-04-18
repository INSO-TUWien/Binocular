import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataPluginOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export interface CodeOwnershipData {
  rawData: DataPluginOwnership[];
  previousFilenames: { [p: string]: string[] };
  //fileOwnership: FileOwnershipCollection;
}

interface DateRange {
  from: string;
  to: string;
}

export interface CodeOwnershipState {
  data: CodeOwnershipData;
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: CodeOwnershipState = {
  data: { rawData: [], previousFilenames: {} },
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const dataSlice = createSlice({
  name: 'codeOwnership',
  initialState,
  reducers: {
    setData: (state: CodeOwnershipState, action: PayloadAction<CodeOwnershipData>) => {
      state.data = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setData, setDateRange, setDataState } = dataSlice.actions;
export default dataSlice.reducer;
