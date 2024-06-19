import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../types/notificationType.ts';

export interface NotificationsInitialState {
  notificationList: Notification[];
  currID: number;
}

const initialState: NotificationsInitialState = {
  notificationList: [],
  currID: 0,
};

export const notificationsSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      action.payload.id = state.currID;
      state.notificationList.push(action.payload);
      state.currID++;
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notificationList = state.notificationList.filter((notification) => notification.id !== action.payload);
    },
  },
});

export const { addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
