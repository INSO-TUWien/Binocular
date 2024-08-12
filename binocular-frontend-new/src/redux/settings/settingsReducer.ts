import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Config from '../../config.ts';
import { GeneralSettingsType, SettingsGeneralGridSize } from '../../types/settings/generalSettingsType.ts';
import { DatabaseSettingsDataPluginType, DatabaseSettingsType } from '../../types/settings/databaseSettingsType.ts';

export interface SettingsInitialState {
  general: GeneralSettingsType;
  database: DatabaseSettingsType;
}

const initialState: SettingsInitialState = {
  general: {
    gridSize: SettingsGeneralGridSize.medium,
  },
  database: {
    dataPlugins: [],
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
    addDataPlugin: (state, action: PayloadAction<DatabaseSettingsDataPluginType>) => {
      if (state.database.dataPlugins.length === 0) {
        action.payload.isDefault = true;
      } else {
        action.payload.isDefault = false;
      }
      action.payload.id = state.database.dataPlugins.length;
      state.database.dataPlugins.push(action.payload);
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    removeDataPlugin: (state, action: PayloadAction<number>) => {
      state.database.dataPlugins = state.database.dataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.id !== action.payload);
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDataPluginAsDefault: (state, action: PayloadAction<number>) => {
      state.database.dataPlugins = state.database.dataPlugins.map((dP: DatabaseSettingsDataPluginType) => {
        dP.isDefault = dP.id === action.payload;
        return dP;
      });
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

export const { setGeneralSettings, addDataPlugin, removeDataPlugin, setDataPluginAsDefault, clearSettingsStorage, importSettingsStorage } =
  settingsSlice.actions;
export default settingsSlice.reducer;
