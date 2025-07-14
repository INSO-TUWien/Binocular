import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import DashboardReducer from './reducer/general/dashboardReducer.ts';
import AuthorsReducer from './reducer/data/authorsReducer.ts';
import AccountsReducer from './reducer/data/accountsReducer.ts';
import SettingsReducer from './reducer/settings/settingsReducer.ts';
import ParametersReducer from './reducer/parameters/parametersReducer.ts';
import SprintsReducer from './reducer/data/sprintsReducer.ts';
import NotificationsReducer from './reducer/general/notificationsReducer.ts';
import ExportReducer from './reducer/export/exportReducer.ts';
import TabsReducer from './reducer/general/tabsReducer.ts';
import { createLogger } from 'redux-logger';
import FilesReducer from './reducer/data/filesReducer.ts';
import ActionsReducer from './reducer/general/actionsReducer.ts';
import actionsMiddleware from './middleware/actions/actionsMiddleware.ts';
import LayoutReducer from './reducer/general/layoutReducer';

const logger = createLogger({
  collapsed: () => true,
});
// Simple change frequency reducer for global store
const changeFrequencyReducer = (
  state = {
    state: {
      currentPath: '',
      hierarchyStack: [],
    },
    hierarchyData: [],
    loading: false,
    config: {
      commitSpan: [new Date(0).toISOString(), new Date().toISOString()],
    },
  },
  action: any,
) => {
  switch (action.type) {
    case 'changeFrequency/setGlobalState':
      return { ...state, state: { ...state.state, ...action.payload } };
    case 'changeFrequency/setGlobalHierarchyData':
      return { ...state, hierarchyData: action.payload };
    case 'changeFrequency/setGlobalLoading':
      return { ...state, loading: action.payload };
    case 'changeFrequency/setGlobalConfig':
      return { ...state, config: { ...state.config, ...action.payload } };
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    dashboard: DashboardReducer,
    layout: LayoutReducer,
    authors: AuthorsReducer,
    accounts: AccountsReducer,
    files: FilesReducer,
    settings: SettingsReducer,
    export: ExportReducer,
    parameters: ParametersReducer,
    sprints: SprintsReducer,
    notifications: NotificationsReducer,
    tabs: TabsReducer,
    actions: ActionsReducer,
    changeFrequency: changeFrequencyReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(actionsMiddleware(), logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
