import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardItemType } from '../components/dashboard/dashboardItem/dashboardItem.tsx';
import { DragResizeMode } from '../components/dashboard/resizeMode.ts';

export interface DashboardInitialState {
  dashboardItems: DashboardItemType[];
  dragResizeMode: DragResizeMode;
  placeableItem: DashboardItemType;
}

const initialState: DashboardInitialState = {
  dashboardItems: [],
  dragResizeMode: DragResizeMode.none,
  placeableItem: { id: 0, x: 0, y: 0, width: 1, height: 1, pluginName: '' },
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dragResizeMode = DragResizeMode.none;
      action.payload.id = state.dashboardItems.length;
      state.dashboardItems = [...state.dashboardItems, action.payload];
    },
    moveDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dashboardItems = state.dashboardItems.map((item) => {
        if (item.id === action.payload.id) {
          item.x = action.payload.x;
          item.y = action.payload.y;
          item.width = action.payload.width;
          item.height = action.payload.height;
        }
        return item;
      });
    },
    placeDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dragResizeMode = DragResizeMode.place;
      state.placeableItem = action.payload;
    },
    setDragResizeMode: (state, action: PayloadAction<DragResizeMode>) => {
      state.dragResizeMode = action.payload;
    },
  },
});

export const { addDashboardItem, moveDashboardItem, placeDashboardItem, setDragResizeMode } = dashboardSlice.actions;
export default dashboardSlice.reducer;
