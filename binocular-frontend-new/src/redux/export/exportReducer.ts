import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ExportType {
  all,
  image,
  data,
}

export interface ExportInitialState {
  exportType: ExportType;
  exportSVGData: string;
  exportName: string;
}

const initialState: ExportInitialState = {
  exportType: ExportType.all,
  exportSVGData: '<svg></svg>',
  exportName: 'export',
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
  },
});

export const { setExportType, setExportSVGData, setExportName } = exportSlice.actions;
export default exportSlice.reducer;
