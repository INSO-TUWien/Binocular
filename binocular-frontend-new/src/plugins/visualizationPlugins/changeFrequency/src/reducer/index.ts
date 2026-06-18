import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FileChangeData } from './data';
import type { HierarchyNode } from '../utilities/hierarchy';

export interface DateRange {
  from: string;
  to: string;
}

export interface ChangeFrequencyState {
  // Flat per-file aggregation produced from the loaded commits.
  fileData: FileChangeData[];
  // The hierarchy level currently shown in the chart (root, or the children of currentPath).
  hierarchyData: HierarchyNode[];
  // Drill-down navigation state.
  currentPath: string;
  hierarchyStack: string[];
  // Date range the data was (or will be) loaded for. Fed from the dashboard item parameters.
  dateRange: DateRange;
  loading: boolean;
}

const initialState: ChangeFrequencyState = {
  fileData: [],
  hierarchyData: [],
  currentPath: '',
  hierarchyStack: [],
  dateRange: { from: new Date(0).toISOString(), to: new Date().toISOString() },
  loading: false,
};

export const changeFrequencySlice = createSlice({
  name: 'changeFrequency',
  initialState,
  reducers: {
    setFileData: (state, action: PayloadAction<FileChangeData[]>) => {
      state.fileData = action.payload;
    },
    setHierarchyData: (state, action: PayloadAction<HierarchyNode[]>) => {
      state.hierarchyData = action.payload;
    },
    setNavigation: (state, action: PayloadAction<{ currentPath: string; hierarchyStack: string[] }>) => {
      state.currentPath = action.payload.currentPath;
      state.hierarchyStack = action.payload.hierarchyStack;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setFileData, setHierarchyData, setNavigation, setDateRange, setLoading } = changeFrequencySlice.actions;
export default changeFrequencySlice.reducer;
