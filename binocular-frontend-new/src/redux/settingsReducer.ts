import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dataPlugins } from '../plugins/pluginRegistry.ts';

export interface SettingsInitialState {
  dataPlugin: string;
}

const initialState: SettingsInitialState = {
  dataPlugin: dataPlugins[0].name,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDataPlugin: (state, action: PayloadAction<string>) => {
      state.dataPlugin = action.payload;
    },
  },
});

export const { setDataPlugin } = settingsSlice.actions;
export default settingsSlice.reducer;
