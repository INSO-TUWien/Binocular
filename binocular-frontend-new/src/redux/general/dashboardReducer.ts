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
  dashboardState: number[][];
}

enum DashboardStateUpdateType {
  place,
  move,
  delete,
}

const initialState: DashboardInitialState = {
  dashboardItems: [],
  dragResizeMode: DragResizeMode.none,
  placeableItem: { id: 0, x: 0, y: 0, width: 1, height: 1, pluginName: '' },
  dashboardItemCount: 0,
  popupCount: 0,
  dashboardState: Array.from(Array(40), () => new Array(40).fill(0)),
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: () => {
    const storedState = localStorage.getItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    addDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dragResizeMode = DragResizeMode.none;
      console.log(state.dashboardState);
      const nextFreePosition = findNextFreePosition(state.dashboardState, action.payload);
      if (nextFreePosition !== null) {
        state.dashboardItemCount++;
        action.payload.id = state.dashboardItemCount;
        action.payload.x = nextFreePosition.x;
        action.payload.y = nextFreePosition.y;
        console.log(action.payload);
        state.dashboardItems = [...state.dashboardItems, action.payload];
        state.dashboardState = updateDashboardState(state.dashboardState, action.payload, DashboardStateUpdateType.place);
        localStorage.setItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
      }
    },
    moveDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      if (checkIfEmpty(state.dashboardState, action.payload)) {
        state.dashboardItems = state.dashboardItems.map((item: DashboardItemType) => {
          if (item.id === action.payload.id) {
            item.x = action.payload.x;
            item.y = action.payload.y;
            item.width = action.payload.width;
            item.height = action.payload.height;
          }
          return item;
        });
        state.dashboardState = updateDashboardState(state.dashboardState, action.payload, DashboardStateUpdateType.move);
      }
      localStorage.setItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    placeDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dragResizeMode = DragResizeMode.place;
      if (checkIfEmpty(state.dashboardState, action.payload)) {
        state.placeableItem = action.payload;
        state.dashboardState = updateDashboardState(state.dashboardState, action.payload, DashboardStateUpdateType.place);
        localStorage.setItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
      }
    },
    deleteDashboardItem: (state, action: PayloadAction<DashboardItemType>) => {
      state.dashboardItems = state.dashboardItems.filter((item: DashboardItemType) => item.id !== action.payload.id);
      state.dashboardState = updateDashboardState(state.dashboardState, action.payload, DashboardStateUpdateType.delete);
      localStorage.setItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    setDragResizeMode: (state, action: PayloadAction<DragResizeMode>) => {
      state.dragResizeMode = action.payload;
      localStorage.setItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    increasePopupCount: (state) => {
      state.popupCount++;
      localStorage.setItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
    clearDashboardStorage: () => {
      localStorage.removeItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`);
    },
    importDashboardStorage: (state, action: PayloadAction<DashboardInitialState>) => {
      state = action.payload;
      localStorage.setItem(`${dashboardSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const {
  addDashboardItem,
  moveDashboardItem,
  placeDashboardItem,
  deleteDashboardItem,
  setDragResizeMode,
  increasePopupCount,
  clearDashboardStorage,
  importDashboardStorage,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;

function checkIfEmpty(dashboardState: number[][], item: DashboardItemType) {
  for (let y = item.y; y < item.y + item.height; y++) {
    for (let x = item.x; x < item.x + item.width; x++) {
      if (dashboardState[y][x] !== 0 && dashboardState[y][x] !== item.id) {
        return false;
      }
    }
  }
  return true;
}

function updateDashboardState(dashboardState: number[][], item: DashboardItemType, dashboardStateUpdateType: DashboardStateUpdateType) {
  for (let y = 0; y < dashboardState.length; y++) {
    for (let x = 0; x < dashboardState[y].length; x++) {
      if (
        (dashboardStateUpdateType === DashboardStateUpdateType.move || dashboardStateUpdateType === DashboardStateUpdateType.delete) &&
        dashboardState[y][x] === item.id
      ) {
        dashboardState[y][x] = 0;
      }
      if (
        (dashboardStateUpdateType === DashboardStateUpdateType.move || dashboardStateUpdateType === DashboardStateUpdateType.place) &&
        x >= item.x &&
        x < item.x + item.width &&
        y >= item.y &&
        y < item.y + item.height
      ) {
        dashboardState[y][x] = item.id;
      }
    }
  }
  return dashboardState;
}

function findNextFreePosition(dashboardState: number[][], item: DashboardItemType): { x: number; y: number } | null {
  for (let y = 0; y < dashboardState.length; y++) {
    for (let x = 0; x < dashboardState[y].length; x++) {
      if (checkIfEmpty(dashboardState, { id: 0, x: x, y: y, width: item.width, height: item.height, pluginName: '' })) {
        return { x: x, y: y };
      }
    }
  }
  return null;
}
