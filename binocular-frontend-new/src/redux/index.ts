import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import DashboardReducer from './general/dashboardReducer.ts';
import AuthorsReducer from './data/authorsReducer.ts';
import SettingsReducer from './settings/settingsReducer.ts';
import ParametersReducer from './parameters/parametersReducer.ts';
import SprintsReducer from './data/sprintsReducer.ts';
import NotificationsReducer from './general/notificationsReducer.ts';
import ExportReducer from './export/exportReducer.ts';
import TabsReducer from './general/tabsReducer.ts';
import { createLogger } from 'redux-logger';
import FilesReducer from './data/filesReducer.ts';

const logger = createLogger({
  collapsed: () => true,
});
export const store = configureStore({
  reducer: {
    dashboard: DashboardReducer,
    authors: AuthorsReducer,
    files: FilesReducer,
    settings: SettingsReducer,
    export: ExportReducer,
    parameters: ParametersReducer,
    sprints: SprintsReducer,
    notifications: NotificationsReducer,
    tabs: TabsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
