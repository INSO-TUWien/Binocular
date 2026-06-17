import { createSlice } from '@reduxjs/toolkit';
import Config from '../../../config';
import type { DashboardLayout } from '../../../types/general/dashboardLayoutType.ts';
import { cloneDeep } from 'lodash';

export interface LayoutsInitialState {
  customLayouts: DashboardLayout[];
  customLayoutCount: number;
}

const initialState: LayoutsInitialState = {
  customLayouts: [],
  customLayoutCount: 0,
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState: () => {
    const storedState = localStorage.getItem(`${Config.localStoragePrefix}${layoutSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(
        `${Config.localStoragePrefix}${layoutSlice.name}StateV${Config.localStorageVersion}`,
        JSON.stringify(initialState),
      );
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },

  reducers: {
    addCustomLayout(state, action: { payload: DashboardLayout }) {
      const newLayout = cloneDeep(action.payload);
      newLayout.id = state.customLayoutCount;
      state.customLayouts = [...state.customLayouts, newLayout];
      state.customLayoutCount++;
      localStorage.setItem(`${Config.localStoragePrefix}${layoutSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    saveChanges(state, action: { payload: DashboardLayout }) {
      state.customLayouts = state.customLayouts.map((layout: DashboardLayout) => {
        if (layout.id === action.payload.id) {
          return action.payload;
        }
        return layout;
      });
      localStorage.setItem(`${Config.localStoragePrefix}${layoutSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    deleteCustomLayout(state, action: { payload: number }) {
      state.customLayouts = state.customLayouts.filter((layout: DashboardLayout) => layout.id !== action.payload);
      localStorage.setItem(`${Config.localStoragePrefix}${layoutSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearLayoutStorage: () => {
      localStorage.removeItem(`${Config.localStoragePrefix}${layoutSlice.name}StateV${Config.localStorageVersion}`);
    },
  },
});

export const { addCustomLayout, saveChanges, deleteCustomLayout, clearLayoutStorage } = layoutSlice.actions;
export default layoutSlice.reducer;
