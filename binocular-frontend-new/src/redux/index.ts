import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import DashboardReducer from './DashboardReducer';

export const store = configureStore({
  reducer: {
    dashboard: DashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
