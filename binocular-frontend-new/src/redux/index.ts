import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import DashboardReducer from './dashboardReducer';
import AuthorsReducer from './authorsReducer.ts';
import SettingsReducer from './settingsReducer.ts';

export const store = configureStore({
  reducer: {
    dashboard: DashboardReducer,
    authors: AuthorsReducer,
    settings: SettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
