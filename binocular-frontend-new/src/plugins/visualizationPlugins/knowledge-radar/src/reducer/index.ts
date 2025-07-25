import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

interface DateRange {
  from: string;
  to: string;
}

export interface State {
  data: DataPluginCommit[];
  dateRange: DateRange;
  dataState: DataState;
}

const initialState: State = {
  data: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
  dataState: DataState.EMPTY,
};

export const dataSlice = createSlice({
  name: 'knowledge-radar',
  initialState,
  reducers: {
    setData: (state: State, action: PayloadAction<DataPluginCommit[]>) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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

//export const { setData, setDateRange, setDataState } = dataSlice.actions;
export default dataSlice.reducer;
