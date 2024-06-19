import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import DashboardReducer from './dashboardReducer';
import AuthorsReducer from './authorsReducer.ts';
import SettingsReducer from './settingsReducer.ts';
import ParametersReducer from './parametersReducer.ts';
import SprintsReducer from './sprintsReducer.ts';
import NotificationsReducer from './notificationsReducer.ts';

export const store = configureStore({
  reducer: {
    dashboard: DashboardReducer,
    authors: AuthorsReducer,
    settings: SettingsReducer,
    parameters: ParametersReducer,
    sprints: SprintsReducer,
    notifications: NotificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
