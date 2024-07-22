import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import Reducer from './reducer.ts';

export const store = configureStore({
  reducer: { changes: Reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
