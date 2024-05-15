import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import DashboardReducer from './DashboardReducer';
import AuthorsReducer from './AuthorsReducer.ts';

export const store = configureStore({
  reducer: {
    dashboard: DashboardReducer,
    authors: AuthorsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
