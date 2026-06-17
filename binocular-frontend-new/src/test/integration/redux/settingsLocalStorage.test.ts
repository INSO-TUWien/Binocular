// I2 — settingsReducer + localStorage persistence
//
// Verifies round-trip: every mutation writes to localStorage, and a new store
// created after the mutation hydrates from that persisted state.
//
// localStorage key: `${Config.localStoragePrefix}settingsStateV${Config.localStorageVersion}`
// IMPORTANT: store must be created AFTER clearing/seeding localStorage because
// the reducer reads it synchronously during initialState factory execution.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Config from '../../../config.ts';
import { configureStore } from '@reduxjs/toolkit';
import type { Middleware } from 'redux';

import SettingsReducer, {
  addDataPlugin,
  removeDataPlugin,
  setDataPluginAsDefault,
  clearSettingsStorage,
  setGeneralSettings,
} from '../../../redux/reducer/settings/settingsReducer.ts';
import ActionsReducer from '../../../redux/reducer/general/actionsReducer.ts';
import actionsMiddleware from '../../../redux/middleware/actions/actionsMiddleware.ts';
import { SettingsGeneralGridSize } from '../../../types/settings/generalSettingsType.ts';
import type { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType.ts';

const LS_KEY = `${Config.localStoragePrefix}settingsStateV${Config.localStorageVersion}`;

function createStore() {
  return configureStore({
    reducer: { settings: SettingsReducer, actions: ActionsReducer },
    middleware: (gDM) => gDM().concat(actionsMiddleware() as Middleware),
  });
}

const basePlugin = {
  name: 'TestPlugin',
  color: '#123456',
  isDefault: false,
  parameters: { apiKey: undefined, endpoint: undefined, fileName: undefined, progressUpdate: undefined },
} as const;

describe('I2 — settingsReducer + localStorage persistence', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  // ── I2.1 — fresh store writes initial state to localStorage ───────────────

  it('I2.1 — fresh store writes initial state to localStorage', () => {
    createStore();
    const raw = localStorage.getItem(LS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.database.dataPlugins).toEqual([]);
    expect(parsed.initialized).toBe(false);
  });

  // ── I2.2 — store hydrates from pre-seeded localStorage ───────────────────

  it('I2.2 — store hydrates from pre-seeded localStorage', () => {
    const seed = {
      general: { gridSize: 'large' },
      initialized: true,
      database: { currID: 3, dataPlugins: [{ id: 3, name: 'Seeded', color: '#abc', isDefault: true, parameters: {} }] },
      localDatabaseLoadingState: 0,
      localDatabaseLoadingMessage: '',
    };
    localStorage.setItem(LS_KEY, JSON.stringify(seed));

    const store = createStore();
    expect(store.getState().settings.database.dataPlugins).toHaveLength(1);
    expect(store.getState().settings.database.dataPlugins[0].name).toBe('Seeded');
  });

  // ── I2.3 — addDataPlugin assigns id and persists ──────────────────────────

  it('I2.3 — addDataPlugin (no id) assigns id: 1 and persists to localStorage', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));

    const plugin = store.getState().settings.database.dataPlugins[0];
    expect(plugin.id).toBe(1);
    expect(plugin.name).toBe('TestPlugin');

    const parsed = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(parsed.database.dataPlugins[0].id).toBe(1);
  });

  // ── I2.4 — first plugin is automatically default ──────────────────────────

  it('I2.4 — first added plugin is automatically default', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));
    const plugin = store.getState().settings.database.dataPlugins[0];
    expect(plugin.isDefault).toBe(true);
    expect(store.getState().settings.database.defaultDataPluginItemId).toBe(plugin.id);
  });

  // ── I2.5 — second plugin is not default ──────────────────────────────────

  it('I2.5 — second added plugin is not default', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));
    store.dispatch(addDataPlugin({ ...basePlugin, name: 'Second' }));
    const plugins = store.getState().settings.database.dataPlugins;
    expect(plugins[1].isDefault).toBe(false);
  });

  // ── I2.6 — addDataPlugin with existing id performs upsert ────────────────

  it('I2.6 — addDataPlugin with existing id updates instead of inserting', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));
    const id = store.getState().settings.database.dataPlugins[0].id;

    store.dispatch(addDataPlugin({ ...basePlugin, id, name: 'Updated' }));

    const plugins = store.getState().settings.database.dataPlugins;
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe('Updated');
  });

  // ── I2.7 — removeDataPlugin removes and persists ──────────────────────────

  it('I2.7 — removeDataPlugin removes entry and updates localStorage', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));
    const id = store.getState().settings.database.dataPlugins[0].id;

    store.dispatch(removeDataPlugin(id));

    expect(store.getState().settings.database.dataPlugins).toHaveLength(0);
    const parsed = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(parsed.database.dataPlugins).toHaveLength(0);
  });

  // ── I2.8 — setDataPluginAsDefault marks exactly one plugin ───────────────

  it('I2.8 — setDataPluginAsDefault marks exactly one plugin as default', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));
    store.dispatch(addDataPlugin({ ...basePlugin, name: 'Second' }));
    const secondId = store.getState().settings.database.dataPlugins[1].id;

    store.dispatch(setDataPluginAsDefault(secondId));

    const plugins = store.getState().settings.database.dataPlugins;
    expect(plugins.filter((p: DatabaseSettingsDataPluginType) => p.isDefault)).toHaveLength(1);
    expect(plugins.find((p: DatabaseSettingsDataPluginType) => p.id === secondId)!.isDefault).toBe(true);
    expect(plugins.find((p: DatabaseSettingsDataPluginType) => p.id !== secondId)!.isDefault).toBe(false);
  });

  // ── I2.9 — clearSettingsStorage removes the key ───────────────────────────

  it('I2.9 — clearSettingsStorage removes the localStorage key', () => {
    const store = createStore();
    expect(localStorage.getItem(LS_KEY)).not.toBeNull();

    store.dispatch(clearSettingsStorage());
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });

  // ── I2.10 — setGeneralSettings persists ───────────────────────────────────

  it('I2.10 — setGeneralSettings persists new value to localStorage', () => {
    const store = createStore();
    store.dispatch(setGeneralSettings({ gridSize: SettingsGeneralGridSize.large }));

    const parsed = JSON.parse(localStorage.getItem(LS_KEY)!);
    expect(parsed.general.gridSize).toBe(SettingsGeneralGridSize.large);
    expect(store.getState().settings.general.gridSize).toBe(SettingsGeneralGridSize.large);
  });

  // ── I2.11 — removeDataPlugin (default) promotes first remaining plugin ────

  it('I2.11 — removing the default plugin promotes the first remaining plugin to default', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));
    store.dispatch(addDataPlugin({ ...basePlugin, name: 'Second' }));

    const defaultId = store.getState().settings.database.defaultDataPluginItemId;
    store.dispatch(removeDataPlugin(defaultId));

    const plugins = store.getState().settings.database.dataPlugins;
    expect(plugins).toHaveLength(1);
    expect(plugins[0].isDefault).toBe(true);
    expect(store.getState().settings.database.defaultDataPluginItemId).toBe(plugins[0].id);
  });

  // ── I2.12 — removeDataPlugin (default, last) clears defaultDataPluginItemId

  it('I2.12 — removing the only (default) plugin clears defaultDataPluginItemId', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));

    const defaultId = store.getState().settings.database.defaultDataPluginItemId;
    store.dispatch(removeDataPlugin(defaultId));

    expect(store.getState().settings.database.dataPlugins).toHaveLength(0);
    expect(store.getState().settings.database.defaultDataPluginItemId).toBeUndefined();
  });

  // ── I2.13 — removeDataPlugin (non-default) leaves default unchanged ────────

  it('I2.13 — removing a non-default plugin leaves the default unchanged', () => {
    const store = createStore();
    store.dispatch(addDataPlugin(basePlugin));
    store.dispatch(addDataPlugin({ ...basePlugin, name: 'Second' }));

    const defaultId = store.getState().settings.database.defaultDataPluginItemId;
    const nonDefaultId = store.getState().settings.database.dataPlugins.find((p: DatabaseSettingsDataPluginType) => p.id !== defaultId)!.id;

    store.dispatch(removeDataPlugin(nonDefaultId));

    expect(store.getState().settings.database.defaultDataPluginItemId).toBe(defaultId);
    const remaining = store.getState().settings.database.dataPlugins;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].isDefault).toBe(true);
  });
});
