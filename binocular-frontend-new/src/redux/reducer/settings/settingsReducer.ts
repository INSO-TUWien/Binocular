import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import Config from '../../../config.ts';
import { type GeneralSettingsType, SettingsGeneralGridSize } from '../../../types/settings/generalSettingsType.ts';
import type { DatabaseSettingsDataPluginType, DatabaseSettingsType } from '../../../types/settings/databaseSettingsType.ts';
import distinctColors from 'distinct-colors';

const BASE_PALETTE = distinctColors({ count: 10, chromaMin: 40 });

function generateColorById(id: number, isDark: boolean): string {
  const base = BASE_PALETTE[id % 10];
  const cycle = Math.floor(id / 10);
  const adjusted = base.set('hsl.l', Math.min(0.85, base.get('hsl.l') + cycle * 0.08));
  return adjusted.hex() + (isDark ? '75' : '25');
}
import { cloneDeep } from 'lodash';

export interface SettingsInitialState {
  general: GeneralSettingsType;
  initialized: boolean;
  database: DatabaseSettingsType;
  localDatabaseLoadingState: LocalDatabaseLoadingState;
  localDatabaseLoadingMessage: string;
}

export enum LocalDatabaseLoadingState {
  none,
  loading,
}

const initialState: SettingsInitialState = {
  general: {
    gridSize: SettingsGeneralGridSize.medium,
  },
  initialized: false,
  database: {
    currID: 0,
    dataPlugins: [],
  },
  localDatabaseLoadingState: LocalDatabaseLoadingState.none,
  localDatabaseLoadingMessage: '',
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
      const newDataPlugin = cloneDeep(action.payload);
      if (newDataPlugin.id === undefined) {
        const isDark = localStorage.getItem('theme') === 'binocularDark';
        newDataPlugin.isDefault = state.database.dataPlugins.length === 0;

        state.database.currID++;
        if (newDataPlugin.color === '#000') {
          newDataPlugin.color = generateColorById(state.database.currID, isDark);
        }
        newDataPlugin.id = state.database.currID;
        if (newDataPlugin.isDefault) {
          state.database.defaultDataPluginItemId = newDataPlugin.id;
        }
        state.database.dataPlugins.push(newDataPlugin);
        console.log(`Inserted dataPlugin ${newDataPlugin.id}`);
      } else {
        let found = false;
        state.database.dataPlugins = state.database.dataPlugins.map((dp: DatabaseSettingsDataPluginType) => {
          if (dp.id === newDataPlugin.id) {
            found = true;
            return newDataPlugin;
          }
          return dp;
        });
        if (newDataPlugin.isDefault) {
          state.database.defaultDataPluginItemId = newDataPlugin.id;
        }
        if (!found) {
          state.database.dataPlugins.push(newDataPlugin);
          console.log(`Inserted dataPlugin ${newDataPlugin.id}`);
        } else {
          console.log(`Updated dataPlugin ${newDataPlugin.id}`);
        }
      }
      state.initialized = true;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    removeDataPlugin: (state, action: PayloadAction<number>) => {
      const wasDefault = state.database.defaultDataPluginItemId === action.payload;
      state.database.dataPlugins = state.database.dataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.id !== action.payload);
      if (wasDefault && state.database.dataPlugins.length > 0) {
        state.database.dataPlugins[0].isDefault = true;
        state.database.defaultDataPluginItemId = state.database.dataPlugins[0].id;
      } else if (wasDefault) {
        state.database.defaultDataPluginItemId = undefined;
      }
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDataPluginAsDefault: (state, action: PayloadAction<number>) => {
      state.database.dataPlugins = state.database.dataPlugins.map((dP: DatabaseSettingsDataPluginType) => {
        dP.isDefault = dP.id === action.payload;
        return dP;
      });
      state.database.defaultDataPluginItemId = action.payload;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearSettingsStorage: () => {
      localStorage.removeItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`);
    },
    importSettingsStorage: (state, action: PayloadAction<SettingsInitialState>) => {
      state = action.payload;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setLocalDatabaseLoadingState: (state, action: PayloadAction<LocalDatabaseLoadingState>) => {
      state.localDatabaseLoadingState = action.payload;
    },
    setLocalDatabaseLoadingMessage: (state, action: PayloadAction<string>) => {
      state.localDatabaseLoadingMessage = action.payload;
    },
    initializeSettingsState: (state) => {
      state.initialized = true;
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    recalculateDataPluginColors: (state, action: PayloadAction<string>) => {
      const isDark = action.payload === 'binocularDark';
      state.database.dataPlugins = state.database.dataPlugins.map((dp: DatabaseSettingsDataPluginType) => ({
        ...dp,
        color: generateColorById(dp.id ?? 0, isDark),
      }));
      localStorage.setItem(`${settingsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const {
  setGeneralSettings,
  addDataPlugin,
  removeDataPlugin,
  setDataPluginAsDefault,
  clearSettingsStorage,
  importSettingsStorage,
  setLocalDatabaseLoadingState,
  setLocalDatabaseLoadingMessage,
  initializeSettingsState,
  recalculateDataPluginColors,
} = settingsSlice.actions;
export default settingsSlice.reducer;
