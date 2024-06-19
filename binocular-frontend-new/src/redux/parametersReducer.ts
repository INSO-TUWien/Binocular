import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ParametersGeneralType } from '../types/parametersGeneralType.ts';
import { ParametersDateRangeType } from '../types/parametersDateRangeType.ts';
import Config from "../config.ts";

export interface ParametersInitialState {
  parametersGeneral: ParametersGeneralType;
  parametersDateRange: ParametersDateRangeType;
}

const currentDate = new Date();
const currentDateLastYear = new Date();
currentDateLastYear.setFullYear(currentDate.getFullYear() - 1);

export const parametersInitialState: ParametersInitialState = {
  parametersGeneral: { granularity: 'months', excludeMergeCommits: false },
  parametersDateRange: { from: currentDateLastYear.toISOString(), to: currentDate.toISOString() },
};

export const paramtersSlice = createSlice({
  name: 'parameters',
  initialState: () => {
    const storedState = localStorage.getItem(`parametersStateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`parametersStateV${Config.localStorageVersion}`, JSON.stringify(parametersInitialState));
      return parametersInitialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setParametersGeneral: (state, action: PayloadAction<ParametersGeneralType>) => {
      state.parametersGeneral = action.payload;
      localStorage.setItem(`parametersStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setParametersDateRange: (state, action: PayloadAction<ParametersDateRangeType>) => {
      state.parametersDateRange = action.payload;
      localStorage.setItem(`parametersStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setParametersGeneral, setParametersDateRange } = paramtersSlice.actions;
export default paramtersSlice.reducer;
