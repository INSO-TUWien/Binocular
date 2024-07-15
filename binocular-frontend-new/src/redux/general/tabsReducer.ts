import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TabType } from '../../types/general/tabType.ts';
import Config from '../../config.ts';

export interface TabsInitialState {
  tabList: TabType[];
}

const initialState: TabsInitialState = {
  tabList: [],
};

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState: () => {
    const storedState = localStorage.getItem(`tabsStateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`tabsStateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setTabList: (state, action: PayloadAction<TabType[]>) => {
      state.tabList = action.payload;
      localStorage.setItem(`tabsStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setTabList } = tabsSlice.actions;
export default tabsSlice.reducer;
