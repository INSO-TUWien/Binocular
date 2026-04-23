import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

vi.mock('../../../../components/tabs/authors/editAuthorDialog/editAuthorDialog.module.scss', () => ({
  default: {},
}));

import EditAuthorDialog from '../../../../components/tabs/authors/editAuthorDialog/editAuthorDialog.tsx';
import AuthorsReducer, { setAuthorsDataPluginId } from '../../../../redux/reducer/data/authorsReducer.ts';
import AccountsReducer, { setAccountList } from '../../../../redux/reducer/data/accountsReducer.ts';
import type { AuthorType } from '../../../../types/data/authorType.ts';
import type { AccountType } from '../../../../types/data/accountType.ts';

const authorToEdit: AuthorType = {
  id: 1,
  parent: -1,
  color: { main: '#ff0000', secondary: '#ff000055' },
  selected: true,
  user: { id: 'user1', gitSignature: 'Test User', account: null },
};

const aliceAccount: AccountType = { localId: 1, id: 'alice-id', name: 'Alice', user: null, platform: 'github' };
const bobAccount: AccountType = { localId: 2, id: 'bob-id', name: 'Bob', user: null, platform: 'github' };

function createTestStore(authorsDataPluginId: number | undefined, accountLists: { [id: number]: AccountType[] } = {}) {
  return configureStore({
    reducer: {
      authors: AuthorsReducer,
      accounts: AccountsReducer,
    },
    preloadedState: {
      authors: {
        authorLists: authorsDataPluginId !== undefined ? { [authorsDataPluginId]: [authorToEdit] } : {},
        dragging: false,
        authorToEdit: authorToEdit,
        dataPluginId: authorsDataPluginId,
      },
      accounts: {
        accountLists: accountLists,
        dataPluginId: undefined,
      },
    } as never,
  });
}

describe('EditAuthorDialog', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('C42.1 accounts datalist updates when authorsDataPluginId changes', async () => {
    const store = createTestStore(1, { 1: [aliceAccount], 2: [bobAccount] });
    render(
      <Provider store={store}>
        <EditAuthorDialog />
      </Provider>,
    );

    const datalist = document.getElementById('allAccounts');
    expect(datalist?.querySelectorAll('option')).toHaveLength(1);
    expect(datalist?.querySelector('option')?.textContent).toBe('Alice');

    await act(async () => {
      store.dispatch(setAuthorsDataPluginId(2));
    });

    expect(datalist?.querySelectorAll('option')).toHaveLength(1);
    expect(datalist?.querySelector('option')?.textContent).toBe('Bob');
  });

  it('C42.2 accounts datalist updates when accountLists changes for the current plugin', async () => {
    const store = createTestStore(1, { 1: [] });
    render(
      <Provider store={store}>
        <EditAuthorDialog />
      </Provider>,
    );

    const datalist = document.getElementById('allAccounts');
    expect(datalist?.querySelectorAll('option')).toHaveLength(0);

    await act(async () => {
      store.dispatch(setAccountList({ dataPluginId: 1, accounts: [aliceAccount] }));
    });

    expect(datalist?.querySelectorAll('option')).toHaveLength(1);
    expect(datalist?.querySelector('option')?.textContent).toBe('Alice');
  });
});
