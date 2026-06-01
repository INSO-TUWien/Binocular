import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import DataPluginQuickSelect from '../../../components/dataPluginQuickSelect/dataPluginQuickSelect.tsx';
import type { DatabaseSettingsDataPluginType } from '../../../types/settings/databaseSettingsType.ts';
import SettingsReducer from '../../../redux/reducer/settings/settingsReducer.ts';
import DashboardReducer from '../../../redux/reducer/general/dashboardReducer.ts';
import AuthorsReducer from '../../../redux/reducer/data/authorsReducer.ts';
import AccountsReducer from '../../../redux/reducer/data/accountsReducer.ts';
import FilesReducer from '../../../redux/reducer/data/filesReducer.ts';
import ParametersReducer from '../../../redux/reducer/parameters/parametersReducer.ts';
import SprintsReducer from '../../../redux/reducer/data/sprintsReducer.ts';
import ExportReducer from '../../../redux/reducer/export/exportReducer.ts';
import TabsReducer from '../../../redux/reducer/general/tabsReducer.ts';
import ActionsReducer from '../../../redux/reducer/general/actionsReducer.ts';
import NotificationsReducer from '../../../redux/reducer/general/notificationsReducer.ts';
import LayoutReducer from '../../../redux/reducer/general/layoutReducer.ts';
import actionsMiddleware from '../../../redux/middleware/actions/actionsMiddleware.ts';
import type { Middleware } from 'redux';

const testPlugins: DatabaseSettingsDataPluginType[] = [
  { id: 1, name: 'Plugin A', color: '#ff000022', isDefault: true, parameters: {} },
  { id: 2, name: 'Plugin B', color: '#00ff0022', isDefault: false, parameters: {} },
  { id: 3, name: 'Plugin C', color: '#0000ff22', isDefault: false, parameters: {} },
];

const reducerMap = {
  dashboard: DashboardReducer,
  layout: LayoutReducer,
  authors: AuthorsReducer,
  accounts: AccountsReducer,
  files: FilesReducer,
  settings: SettingsReducer,
  export: ExportReducer,
  parameters: ParametersReducer,
  sprints: SprintsReducer,
  notifications: NotificationsReducer,
  tabs: TabsReducer,
  actions: ActionsReducer,
};

function createTestStore(plugins: DatabaseSettingsDataPluginType[] = testPlugins) {
  return configureStore({
    reducer: reducerMap,
    preloadedState: {
      settings: {
        general: { gridSize: 1 },
        initialized: false,
        database: {
          currID: plugins.length,
          dataPlugins: plugins,
          defaultDataPluginItemId: plugins.find((p) => p.isDefault)?.id,
        },
        localDatabaseLoadingState: 0,
        localDatabaseLoadingMessage: '',
      },
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(actionsMiddleware() as Middleware),
  });
}

function renderComponent(
  store: ReturnType<typeof createTestStore>,
  selected: DatabaseSettingsDataPluginType | undefined,
  onChange = vi.fn(),
) {
  return render(
    <Provider store={store}>
      <DataPluginQuickSelect selected={selected} onChange={onChange} />
    </Provider>,
  );
}

describe('DataPluginQuickSelect', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    localStorage.clear();
    store = createTestStore();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('C1.1 renders the trigger element', () => {
    renderComponent(store, testPlugins[0]);
    expect(screen.getByRole('button', { name: /Plugin A #1 \(default\)/i })).toBeInTheDocument();
  });

  it('C1.2 renders one option per data plugin (3 plugins → 3 options)', () => {
    renderComponent(store, testPlugins[0]);
    fireEvent.click(screen.getByRole('button', { name: /Plugin A #1 \(default\)/i }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('C1.3 displays the currently active plugin name in the trigger', () => {
    renderComponent(store, testPlugins[1]);
    expect(screen.getByRole('button', { name: /Plugin B #2/i })).toBeInTheDocument();
  });

  it('C1.4 calls onChange with the selected plugin when user picks', () => {
    const onChange = vi.fn();
    renderComponent(store, testPlugins[0], onChange);
    fireEvent.click(screen.getByRole('button', { name: /Plugin A #1 \(default\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /Plugin B #2/i }));
    expect(onChange).toHaveBeenCalledWith(testPlugins[1]);
  });

  it('C1.5 trigger shows "—" when dataPlugins list is empty', () => {
    const emptyStore = createTestStore([]);
    renderComponent(emptyStore, undefined);
    expect(screen.getByRole('button', { name: '—' })).toBeInTheDocument();
  });

  it('C1.6 trigger has border-color styling when a plugin is selected', () => {
    renderComponent(store, testPlugins[0]);
    const trigger = screen.getByRole('button', { name: /Plugin A #1 \(default\)/i });
    expect(trigger.style.borderColor).toBeTruthy();
  });
});
