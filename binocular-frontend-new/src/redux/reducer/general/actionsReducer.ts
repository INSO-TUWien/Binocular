import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ActionsInitialState {
  lastAction: string | undefined;
  payload?: unknown;
}

const initialState: ActionsInitialState = {
  lastAction: undefined,
};

export const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    setLastAction: (state, action: PayloadAction<{ action: string; payload: unknown }>) => {
      state.lastAction = action.payload.action;
      state.payload = action.payload.payload;
    },
  },
});

export const { setLastAction } = actionsSlice.actions;
export default actionsSlice.reducer;
