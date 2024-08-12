import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dataPlugins } from '../../plugins/pluginRegistry.ts';
import Config from '../../config.ts';
import { GeneralSettingsType, SettingsGeneralGridSize } from '../../types/settings/generalSettingsType.ts';
import { DatabaseSettingsType } from '../../types/settings/databaseSettingsType.ts';

export interface SettingsInitialState {
  general: GeneralSettingsType;
  database: DatabaseSettingsType;
}

const initialState: SettingsInitialState = {
  general: {
    gridSize: SettingsGeneralGridSize.medium,
  },
  database: {
    dataPlugin: {
      name: dataPlugins[0].name,
      parameters: {
        apiKey: '',
        endpoint: '',
      },
    },
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: () => {
    const storedState = localStorage.getItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setGeneralSettings: (state, action: PayloadAction<GeneralSettingsType>) => {
      state.general = action.payload;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDataPluginName: (state, action: PayloadAction<string>) => {
      state.database.dataPlugin.name = action.payload;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDataPluginParameterApiKey: (state, action: PayloadAction<string>) => {
      state.database.dataPlugin.parameters.apiKey = action.payload;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDataPluginParameterEndpoint: (state, action: PayloadAction<string>) => {
      state.database.dataPlugin.parameters.endpoint = action.payload;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearSettingsStorage: () => {
      localStorage.removeItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`);
    },
    importSettingsStorage: (state, action: PayloadAction<SettingsInitialState>) => {
      state = action.payload;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const {
  setGeneralSettings,
  setDataPluginName,
  setDataPluginParameterApiKey,
  setDataPluginParameterEndpoint,
  clearSettingsStorage,
  importSettingsStorage,
} = settingsSlice.actions;
export default settingsSlice.reducer;
