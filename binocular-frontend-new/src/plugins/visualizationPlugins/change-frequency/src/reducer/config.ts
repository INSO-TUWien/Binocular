import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChangeFrequencyConfigState {
  commitSpan: [string, string];
}

const initialState: ChangeFrequencyConfigState = {
  commitSpan: [new Date(0).toISOString(), new Date().toISOString()],
};

const configSlice = createSlice({
  name: 'changeFrequencyConfig',
  initialState,
  reducers: {
    setChangeFrequencyConfig: (state, action: PayloadAction<Partial<ChangeFrequencyConfigState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setChangeFrequencyConfig } = configSlice.actions;
export default configSlice.reducer;
