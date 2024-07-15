import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DragResizeMode } from '../../components/dashboard/resizeMode.ts';
import Config from '../../config.ts';
import { DashboardItemType } from '../../types/general/dashboardItemType.ts';
export interface DashboardInitialState {
  dashboardItems: DashboardItemType[];
  dragResizeMode: DragResizeMode;
  placeableItem: DashboardItemType;
  dashboardItemCount: number;
  popupCount: number;
}

const initialState: DashboardInitialState = {
  dashboardItems: [],
  dragResizeMode: DragResizeMode.none,
  placeableItem: { id: 0, x: 0, y: 0, width: 1, height: 1, pluginName: '' },
  dashboardItemCount: 0,
  popupCount: 0,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: () => {
    const storedState = localStorage.getItem(`dashboardStateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`dashboardStateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    addDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dragResizeMode = DragResizeMode.none;
      action.payload.id = state.dashboardItemCount;
      state.dashboardItemCount++;
      state.dashboardItems = [...state.dashboardItems, action.payload];
      localStorage.setItem(`dashboardStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    moveDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dashboardItems = state.dashboardItems.map((item: DashboardItemType) => {
        if (item.id === action.payload.id) {
          item.x = action.payload.x;
          item.y = action.payload.y;
          item.width = action.payload.width;
          item.height = action.payload.height;
        }
        return item;
      });
      localStorage.setItem(`dashboardStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    placeDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dragResizeMode = DragResizeMode.place;
      state.placeableItem = action.payload;
      localStorage.setItem(`dashboardStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    deleteDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dashboardItems = state.dashboardItems.filter((item: DashboardItemType) => item.id !== action.payload.id);
      localStorage.setItem(`dashboardStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDragResizeMode: (state, action: PayloadAction<DragResizeMode>) => {
      state.dragResizeMode = action.payload;
      localStorage.setItem(`dashboardStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    increasePopupCount: (state) => {
      state.popupCount++;
      localStorage.setItem(`dashboardStateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { addDashboardItem, moveDashboardItem, placeDashboardItem, deleteDashboardItem, setDragResizeMode, increasePopupCount } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
