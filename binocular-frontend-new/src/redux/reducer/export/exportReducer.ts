import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { JSONObject } from '../../../plugins/interfaces/dataPluginInterfaces/dataPluginFiles';

export enum ExportType {
  all,
  image,
  data,
}

export interface ExportInitialState {
  exportType: ExportType;
  exportSVGData: string;
  exportName: string;
  exportLoading: boolean;
  exportDataType: string;
  exportData: { [id: string]: JSONObject[] };
}

const initialState: ExportInitialState = {
  exportType: ExportType.all,
  exportSVGData: '<svg></svg>',
  exportName: 'export',
  exportLoading: false,
  exportDataType: 'json',
  exportData: {},
};

export const exportSlice = createSlice({
  name: 'export',
  initialState,
  reducers: {
    setExportType: (state, action: PayloadAction<ExportType>) => {
      state.exportType = action.payload;
    },
    setExportSVGData: (state, action: PayloadAction<string>) => {
      state.exportSVGData = action.payload;
    },
    setExportName: (state, action: PayloadAction<string>) => {
      state.exportName = action.payload;
    },
    setExportLoading: (state, action: PayloadAction<boolean>) => {
      state.exportLoading = action.payload;
    },
    setExportDataType: (state, action: PayloadAction<string>) => {
      state.exportDataType = action.payload;
    },
    setExportData: (state, action: PayloadAction<{ [id: string]: JSONObject[] }>) => {
      state.exportData = action.payload;
      state.exportLoading = false;
    },
  },
});

export const { setExportType, setExportSVGData, setExportName, setExportLoading, setExportData, setExportDataType } = exportSlice.actions;
export default exportSlice.reducer;
