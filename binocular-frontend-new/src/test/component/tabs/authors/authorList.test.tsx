import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

vi.mock('../../../../utils/dataPluginStorage.ts', () => ({
  default: {
    getDataPlugin: vi.fn(() => new Promise(() => {})),
  },
}));

vi.mock('../../../../components/tabs/authors/authorList/authorList.module.scss', () => ({
  default: {},
}));

vi.mock('../../../../components/tabs/authors/authors.module.scss', () => ({
  default: {},
}));

import AuthorList from '../../../../components/tabs/authors/authorList/authorList.tsx';
import SettingsReducer from '../../../../redux/reducer/settings/settingsReducer.ts';
import AuthorsReducer from '../../../../redux/reducer/data/authorsReducer.ts';
import AccountsReducer from '../../../../redux/reducer/data/accountsReducer.ts';
import type { DatabaseSettingsDataPluginType } from '../../../../types/settings/databaseSettingsType.ts';

function createTestStore(plugins: DatabaseSettingsDataPluginType[], authorsDataPluginId: number | undefined = undefined) {
  return configureStore({
    reducer: {
      settings: SettingsReducer,
      authors: AuthorsReducer,
      accounts: AccountsReducer,
    },
    preloadedState: {
      settings: {
        general: { gridSize: 1 },
        initialized: true,
        database: {
          currID: plugins.length,
          dataPlugins: plugins,
          defaultDataPluginItemId: plugins.find((p) => p.isDefault)?.id,
        },
        localDatabaseLoadingState: 0,
        localDatabaseLoadingMessage: '',
      },
      authors: {
        authorLists: {},
        dragging: false,
        authorToEdit: undefined,
        dataPluginId: authorsDataPluginId,
      },
      accounts: {
        accountLists: {},
        dataPluginId: undefined,
      },
    } as never,
  });
}

describe('AuthorList', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('C41.1 no configured plugins → clears authorsDataPluginId and accountsDataPluginId', async () => {
    const store = createTestStore([], 1);
    await act(async () => {
      render(
        <Provider store={store}>
          <AuthorList />
        </Provider>,
      );
    });
    expect(store.getState().authors.dataPluginId).toBeUndefined();
    expect(store.getState().accounts.dataPluginId).toBeUndefined();
  });

  it('C41.2 selected plugin no longer exists → clears both plugin IDs', async () => {
    const plugin2: DatabaseSettingsDataPluginType = { id: 2, name: 'Plugin2', color: '#aabb', isDefault: false, parameters: {} };
    const store = createTestStore([plugin2], 1);
    await act(async () => {
      render(
        <Provider store={store}>
          <AuthorList />
        </Provider>,
      );
    });
    expect(store.getState().authors.dataPluginId).toBeUndefined();
    expect(store.getState().accounts.dataPluginId).toBeUndefined();
  });

  it('C41.3 selected plugin still exists → plugin IDs unchanged', async () => {
    const plugin1: DatabaseSettingsDataPluginType = { id: 1, name: 'Plugin1', color: '#aabb', isDefault: true, parameters: {} };
    const store = createTestStore([plugin1], 1);
    await act(async () => {
      render(
        <Provider store={store}>
          <AuthorList />
        </Provider>,
      );
    });
    expect(store.getState().authors.dataPluginId).toBe(1);
  });
});
