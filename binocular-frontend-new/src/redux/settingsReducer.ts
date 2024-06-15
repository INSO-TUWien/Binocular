import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dataPlugins } from '../plugins/pluginRegistry.ts';

export interface SettingsInitialState {
  dataPlugin: {
    name: string;
    parameters: {
      apiKey: string;
      endpoint: string;
    };
  };
}

const initialState: SettingsInitialState = {
  dataPlugin: {
    name: dataPlugins[0].name,
    parameters: {
      apiKey: '',
      endpoint: '',
    },
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDataPluginName: (state, action: PayloadAction<string>) => {
      state.dataPlugin.name = action.payload;
    },
    setDataPluginParameterApiKey: (state, action: PayloadAction<string>) => {
      state.dataPlugin.parameters.apiKey = action.payload;
    },
    setDataPluginParameterEndpoint: (state, action: PayloadAction<string>) => {
      state.dataPlugin.parameters.endpoint = action.payload;
    },
  },
});

export const { setDataPluginName, setDataPluginParameterApiKey, setDataPluginParameterEndpoint } = settingsSlice.actions;
export default settingsSlice.reducer;
