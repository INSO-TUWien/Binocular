import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dataPlugins } from '../../plugins/pluginRegistry.ts';
import Config from '../../config.ts';
import { GeneralSettingsType, SettingsGeneralGridSize } from '../../types/settings/generalSettingsType.ts';

export interface SettingsInitialState {
  general: GeneralSettingsType;
  dataPlugin: {
    name: string;
    parameters: {
      apiKey: string;
      endpoint: string;
    };
  };
}

const initialState: SettingsInitialState = {
  general: {
    gridSize: SettingsGeneralGridSize.medium,
  },
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
  initialState: () => {
    const storedState = localStorage.getItem(`settingsStateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`settingsStateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setGeneralSettings: (state, action: PayloadAction<GeneralSettingsType>) => {
      state.general = action.payload;
      localStorage.setItem(`settingsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDataPluginName: (state, action: PayloadAction<string>) => {
      state.dataPlugin.name = action.payload;
      localStorage.setItem(`settingsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDataPluginParameterApiKey: (state, action: PayloadAction<string>) => {
      state.dataPlugin.parameters.apiKey = action.payload;
      localStorage.setItem(`settingsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDataPluginParameterEndpoint: (state, action: PayloadAction<string>) => {
      state.dataPlugin.parameters.endpoint = action.payload;
      localStorage.setItem(`settingsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setGeneralSettings, setDataPluginName, setDataPluginParameterApiKey, setDataPluginParameterEndpoint } =
  settingsSlice.actions;
export default settingsSlice.reducer;
