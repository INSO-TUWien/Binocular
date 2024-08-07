import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ParametersGeneralType } from '../../types/parameters/parametersGeneralType.ts';
import { ParametersDateRangeType } from '../../types/parameters/parametersDateRangeType.ts';
import Config from '../../config.ts';
import { ParametersType } from '../../types/parameters/parametersType.ts';

const currentDate = new Date();
const currentDateLastYear = new Date();
currentDateLastYear.setFullYear(currentDate.getFullYear() - 1);

export const parametersInitialState: ParametersType = {
  parametersGeneral: { granularity: 'months', excludeMergeCommits: false },
  parametersDateRange: { from: currentDateLastYear.toISOString().split('.')[0], to: currentDate.toISOString().split('.')[0] },
};

export const parametersSlice = createSlice({
  name: 'parameters',
  initialState: () => {
    const storedState = localStorage.getItem(`${parametersSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`${parametersSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(parametersInitialState));
      return parametersInitialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setParametersGeneral: (state, action: PayloadAction<ParametersGeneralType>) => {
      state.parametersGeneral = action.payload;
      localStorage.setItem(`${parametersSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setParametersDateRange: (state, action: PayloadAction<ParametersDateRangeType>) => {
      state.parametersDateRange = action.payload;
      localStorage.setItem(`${parametersSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearParametersStorage: () => {
      localStorage.removeItem(`${parametersSlice.name}StateV${Config.localStorageVersion}`);
    },
    importParametersStorage: (state, action: PayloadAction<ParametersType>) => {
      state = action.payload;
      localStorage.setItem(`${parametersSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setParametersGeneral, setParametersDateRange, clearParametersStorage, importParametersStorage } = parametersSlice.actions;
export default parametersSlice.reducer;
