// I9 — DatabaseLoaders.loadJsonFilesToPouchDB dispatch sequence
//
// Verifies the exact sequence of Redux dispatches emitted while loading
// pre-exported JSON into PouchDB. Uses a real Redux store and spies on
// PouchDB.init / PouchDB.clearRemains to avoid loading the full JSON export.
//
// NOTE: databaseLoaders.ts is wrapped in a `// #v-ifdef PRE_CONFIGURE_DB=='pouchdb'`
// directive. The vitest.config.ts does NOT include ConditionalCompile(), so the
// block is NOT stripped during tests and DatabaseLoaders is always available here.
// The db_export/*.json files are imported statically by databaseLoaders.ts and
// must exist (they are checked into the repo under src/db_export/).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import type { Middleware } from 'redux';
import Config from '../../../config.ts';

// Mock PouchDB singleton from pluginRegistry before importing databaseLoaders,
// so PouchDB.init and PouchDB.clearRemains are replaced with spies.
vi.mock('../../../plugins/pluginRegistry.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../plugins/pluginRegistry.ts')>();
  return {
    ...actual,
    PouchDB: {
      init: vi.fn().mockResolvedValue(undefined),
      clearRemains: vi.fn().mockResolvedValue(undefined),
    },
  };
});

import DatabaseLoaders from '../../../utils/databaseLoaders.ts';
import { PouchDB as MockedPouchDB } from '../../../plugins/pluginRegistry.ts';
import SettingsReducer from '../../../redux/reducer/settings/settingsReducer.ts';
import ActionsReducer from '../../../redux/reducer/general/actionsReducer.ts';
import actionsMiddleware from '../../../redux/middleware/actions/actionsMiddleware.ts';
import { LocalDatabaseLoadingState } from '../../../redux/reducer/settings/settingsReducer.ts';

// Metadata values come from the real db_export/metadata.json imported by databaseLoaders.ts
const METADATA_NAMESPACE = 'INSO-World/Binocular';
const METADATA_CREATED_AT = '2026-03-20T14:23:44.145Z';

function createTestStore() {
  return configureStore({
    reducer: {
      settings: SettingsReducer,
      actions: ActionsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(actionsMiddleware() as Middleware),
  });
}

describe('I9 — DatabaseLoaders.loadJsonFilesToPouchDB', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── I9.1 — sets loading state before init ───────────────────────────────

  it('I9.1 — dispatches setLocalDatabaseLoadingState(loading) before init resolves', async () => {
    let loadingStateDuringInit: LocalDatabaseLoadingState | undefined;

    (MockedPouchDB.init as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      loadingStateDuringInit = store.getState().settings.localDatabaseLoadingState;
    });

    const store = createTestStore();
    await DatabaseLoaders.loadJsonFilesToPouchDB(store.dispatch);

    expect(loadingStateDuringInit).toBe(LocalDatabaseLoadingState.loading);
  });

  // ── I9.2 — addDataPlugin after init ─────────────────────────────────────

  it('I9.2 — dispatches addDataPlugin after init completes', async () => {
    const store = createTestStore();
    await DatabaseLoaders.loadJsonFilesToPouchDB(store.dispatch);

    const plugins = store.getState().settings.database.dataPlugins;
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe('PouchDb');
  });

  // ── I9.3 — loading state ends at none ───────────────────────────────────

  it('I9.3 — dispatches setLocalDatabaseLoadingState(none) after addDataPlugin', async () => {
    const store = createTestStore();
    await DatabaseLoaders.loadJsonFilesToPouchDB(store.dispatch);

    expect(store.getState().settings.localDatabaseLoadingState).toBe(LocalDatabaseLoadingState.none);
  });

  // ── I9.4 — REFRESH_PLUGIN as last action ────────────────────────────────

  it('I9.4 — dispatches REFRESH_PLUGIN as the final action', async () => {
    const store = createTestStore();
    await DatabaseLoaders.loadJsonFilesToPouchDB(store.dispatch);

    expect(store.getState().actions.lastAction).toBe('REFRESH_PLUGIN');
  });

  // ── I9.5 — skips loading when existing plugin is same or newer ───────────

  it('I9.5 — skips PouchDB.init when existing plugin createdAt is same or newer', async () => {
    // Pre-seed localStorage with a plugin that matches the current metadata
    const existingState = {
      general: { gridSize: 'medium' },
      initialized: true,
      database: {
        currID: 1,
        dataPlugins: [
          {
            id: 1,
            name: 'PouchDb',
            color: '#8cadfc',
            isDefault: true,
            parameters: { fileName: METADATA_NAMESPACE },
            metadata: { createdAt: METADATA_CREATED_AT, namespace: METADATA_NAMESPACE },
          },
        ],
      },
      localDatabaseLoadingState: 0,
      localDatabaseLoadingMessage: '',
    };
    localStorage.setItem(`${Config.localStoragePrefix}settingsStateV${Config.localStorageVersion}`, JSON.stringify(existingState));

    const store = createTestStore();
    await DatabaseLoaders.loadJsonFilesToPouchDB(store.dispatch);

    expect(MockedPouchDB.init).not.toHaveBeenCalled();
  });

  // ── I9.6 — calls clearRemains when updating a stale plugin ──────────────

  it('I9.6 — calls PouchDB.clearRemains() before init when existing plugin is stale', async () => {
    // Pre-seed with an older createdAt
    const existingState = {
      general: { gridSize: 'medium' },
      initialized: true,
      database: {
        currID: 1,
        dataPlugins: [
          {
            id: 1,
            name: 'PouchDb',
            color: '#8cadfc',
            isDefault: true,
            parameters: { fileName: METADATA_NAMESPACE },
            metadata: { createdAt: '2020-01-01T00:00:00.000Z', namespace: METADATA_NAMESPACE },
          },
        ],
      },
      localDatabaseLoadingState: 0,
      localDatabaseLoadingMessage: '',
    };
    localStorage.setItem(`${Config.localStoragePrefix}settingsStateV${Config.localStorageVersion}`, JSON.stringify(existingState));

    const store = createTestStore();
    await DatabaseLoaders.loadJsonFilesToPouchDB(store.dispatch);

    expect(MockedPouchDB.clearRemains).toHaveBeenCalledOnce();
    // clearRemains must be called before init
    const clearOrder = (MockedPouchDB.clearRemains as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const initOrder = (MockedPouchDB.init as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    expect(clearOrder).toBeLessThan(initOrder);
  });

  // ── I9.7 — added plugin carries correct fileName and metadata ────────────

  it('I9.7 — added plugin carries correct fileName and metadata.createdAt', async () => {
    const store = createTestStore();
    await DatabaseLoaders.loadJsonFilesToPouchDB(store.dispatch);

    const plugin = store.getState().settings.database.dataPlugins[0];
    expect(plugin.parameters.fileName).toBe(METADATA_NAMESPACE);
    expect(plugin.metadata?.createdAt).toBe(METADATA_CREATED_AT);
  });
});
