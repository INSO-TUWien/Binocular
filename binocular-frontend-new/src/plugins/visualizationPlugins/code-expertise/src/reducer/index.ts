import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum DataState {
  EMPTY,
  FETCHING,
  COMPLETE,
}

export interface State<DataType> {
  data: DataType[];
  branch?: number;
  dataState: DataState;
}

const initialState: State<unknown> = {
  data: [],
  branch: undefined,
  dataState: DataState.EMPTY,
};

export const dataSlice = createSlice({
  name: 'code-expertise',
  initialState,
  reducers: {
    setData: <DataType>(state: State<DataType>, action: PayloadAction<DataType[]>) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      state.data = action.payload;
    },
    setCurrentBranch: <DataType>(state: State<DataType>, action: PayloadAction<number | undefined>) => {
      state.branch = action.payload;
    },
    setDataState: (state, action: PayloadAction<DataState>) => {
      state.dataState = action.payload;
    },
  },
});

export const { setData, setCurrentBranch, setDataState } = dataSlice.actions;
export default dataSlice.reducer;
