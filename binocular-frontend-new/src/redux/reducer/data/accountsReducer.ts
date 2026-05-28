import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import Config from '../../../config.ts';
import type { AccountType } from '../../../types/data/accountType.ts';
import { cloneDeep } from 'lodash';

export interface AccountsInitialState {
  accountLists: { [id: number]: AccountType };
  dataPluginId: number | undefined;
}

const initialState: AccountsInitialState = {
  accountLists: {},
  dataPluginId: undefined,
};

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState: () => {
    const storedState = localStorage.getItem(`bino_${accountsSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`bino_${accountsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setAccountList: (state, action: PayloadAction<{ dataPluginId: number; accounts: AccountType[] }>) => {
      let accountList = state.accountLists[action.payload.dataPluginId] || [];
      if (accountList.length !== action.payload.accounts.length) {
        // remove old accounts that are not in the new list
        accountList.forEach((account: AccountType) => {
          if (!action.payload.accounts.find((a: AccountType) => a.id === account.id)) {
            accountList = accountList.filter((a: AccountType) => a.id !== account.id);
          }
        });
        // add new accounts that are not in the list
        action.payload.accounts.forEach((account) => {
          if (!accountList.find((a: AccountType) => a.id === account.id)) {
            const newAccount = cloneDeep(account);
            newAccount.localId = accountList.length + 1;
            accountList.push(newAccount);
          }
        });
      }
      state.accountLists[action.payload.dataPluginId] = accountList;
      localStorage.setItem(`bino_${accountsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setAccountsDataPluginId: (state, action: PayloadAction<number | undefined>) => {
      state.dataPluginId = action.payload;
      localStorage.setItem(`bino_${accountsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearAccountsStorage: () => {
      localStorage.removeItem(`bino_${accountsSlice.name}StateV${Config.localStorageVersion}`);
    },
    importAccountsStorage: (state, action: PayloadAction<AccountsInitialState>) => {
      state = action.payload;
      localStorage.setItem(`bino_${accountsSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setAccountList, setAccountsDataPluginId, clearAccountsStorage, importAccountsStorage } = accountsSlice.actions;
export default accountsSlice.reducer;
