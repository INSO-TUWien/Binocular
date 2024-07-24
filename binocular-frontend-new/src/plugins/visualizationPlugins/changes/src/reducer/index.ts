import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataCommit } from '../../../../interfaces/dataPlugin.ts';

interface DateRange {
  from: string;
  to: string;
}

export interface ChangesState {
  commits: DataCommit[];
  dateRange: DateRange;
}

const initialState: ChangesState = {
  commits: [],
  dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
};

export const changesSlice = createSlice({
  name: 'changes',
  initialState,
  reducers: {
    setCommits: (state, action: PayloadAction<DataCommit[]>) => {
      state.commits = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
  },
});

export const { setCommits, setDateRange } = changesSlice.actions;
export default changesSlice.reducer;
