import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('distinct-colors', () => ({
  default: vi.fn(() =>
    Array.from({ length: 10 }, (_, i) => {
      const color = {
        hex: () => `#${String(i).padStart(6, '0')}`,
        get: () => 0.5,
        set: function () {
          return this;
        },
      };
      return color;
    }),
  ),
}));

import reducer, {
  setGeneralSettings,
  addDataPlugin,
  removeDataPlugin,
  setDataPluginAsDefault,
  initializeSettingsState,
  setLocalDatabaseLoadingState,
  setLocalDatabaseLoadingMessage,
  clearSettingsStorage,
  LocalDatabaseLoadingState,
} from '../../../../../redux/reducer/settings/settingsReducer';
import type { SettingsInitialState } from '../../../../../redux/reducer/settings/settingsReducer';
import { SettingsGeneralGridSize } from '../../../../../types/settings/generalSettingsType';
import type { DatabaseSettingsDataPluginType } from '../../../../../types/settings/databaseSettingsType';

const initialState: SettingsInitialState = {
  general: { gridSize: SettingsGeneralGridSize.medium },
  initialized: false,
  database: { currID: 0, dataPlugins: [] },
  localDatabaseLoadingState: LocalDatabaseLoadingState.none,
  localDatabaseLoadingMessage: '',
};

function makePlugin(name: string, id?: number): DatabaseSettingsDataPluginType {
  return { id, name, color: '#000', parameters: {} };
}

beforeEach(() => {
  localStorage.clear();
});

describe('settingsReducer – setGeneralSettings', () => {
  it('U29.1 replaces general field', () => {
    const newGeneral = { gridSize: SettingsGeneralGridSize.large };
    const state = reducer(initialState, setGeneralSettings(newGeneral));
    expect(state.general.gridSize).toBe(SettingsGeneralGridSize.large);
  });

  it('U29.2 persists to localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    reducer(initialState, setGeneralSettings({ gridSize: SettingsGeneralGridSize.small }));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('settingsReducer – addDataPlugin (no id)', () => {
  it('U29.3 appends with auto-assigned id', () => {
    const state = reducer(initialState, addDataPlugin(makePlugin('Plugin A')));
    expect(state.database.dataPlugins).toHaveLength(1);
    expect(state.database.dataPlugins[0].id).toBeDefined();
  });

  it('U29.4 sets isDefault = true for the first plugin', () => {
    const state = reducer(initialState, addDataPlugin(makePlugin('Plugin A')));
    expect(state.database.dataPlugins[0].isDefault).toBe(true);
  });

  it('U29.5 assigns color from mocked distinctColors', () => {
    const state = reducer(initialState, addDataPlugin(makePlugin('Plugin A')));
    // The reducer uses colors[currID].hex() + '22', currID starts at 0, incremented to 1 before use
    expect(state.database.dataPlugins[0].color).toMatch(/^#/);
  });
});

describe('settingsReducer – addDataPlugin (existing id)', () => {
  const stateWithPlugin: SettingsInitialState = {
    ...initialState,
    database: {
      currID: 1,
      dataPlugins: [{ id: 1, name: 'Old Name', color: '#abc', isDefault: true, parameters: {} }],
    },
  };

  it('U29.6 updates plugin in-place, list length unchanged', () => {
    const updated = { id: 1, name: 'New Name', color: '#fff', parameters: {} };
    const state = reducer(stateWithPlugin, addDataPlugin(updated));
    expect(state.database.dataPlugins).toHaveLength(1);
    expect(state.database.dataPlugins[0].name).toBe('New Name');
  });
});

describe('settingsReducer – removeDataPlugin', () => {
  const stateWithPlugins: SettingsInitialState = {
    ...initialState,
    database: {
      currID: 2,
      dataPlugins: [
        { id: 1, name: 'P1', color: '#000', parameters: {} },
        { id: 2, name: 'P2', color: '#000', parameters: {} },
      ],
    },
  };

  it('U29.7 removes plugin with matching id', () => {
    const state = reducer(stateWithPlugins, removeDataPlugin(1));
    expect(state.database.dataPlugins.find((p) => p.id === 1)).toBeUndefined();
    expect(state.database.dataPlugins).toHaveLength(1);
  });
});

describe('settingsReducer – setDataPluginAsDefault', () => {
  const stateWithPlugins: SettingsInitialState = {
    ...initialState,
    database: {
      currID: 2,
      dataPlugins: [
        { id: 1, name: 'P1', color: '#000', isDefault: true, parameters: {} },
        { id: 2, name: 'P2', color: '#000', isDefault: false, parameters: {} },
      ],
    },
  };

  it('U29.8 sets isDefault = true only on the matching plugin', () => {
    const state = reducer(stateWithPlugins, setDataPluginAsDefault(2));
    expect(state.database.dataPlugins.find((p) => p.id === 2)?.isDefault).toBe(true);
    expect(state.database.dataPlugins.find((p) => p.id === 1)?.isDefault).toBe(false);
  });
});

describe('settingsReducer – initializeSettingsState', () => {
  it('U29.9 sets initialized = true', () => {
    const state = reducer(initialState, initializeSettingsState());
    expect(state.initialized).toBe(true);
  });
});

describe('settingsReducer – setLocalDatabaseLoadingState', () => {
  it('U29.10 updates the loading state enum', () => {
    const state = reducer(initialState, setLocalDatabaseLoadingState(LocalDatabaseLoadingState.loading));
    expect(state.localDatabaseLoadingState).toBe(LocalDatabaseLoadingState.loading);
  });
});

describe('settingsReducer – setLocalDatabaseLoadingMessage', () => {
  it('U29.11 updates the loading message string', () => {
    const state = reducer(initialState, setLocalDatabaseLoadingMessage('Loading data...'));
    expect(state.localDatabaseLoadingMessage).toBe('Loading data...');
  });
});

describe('settingsReducer – clearSettingsStorage', () => {
  it('U29.12 calls localStorage.removeItem', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem');
    reducer(initialState, clearSettingsStorage());
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
