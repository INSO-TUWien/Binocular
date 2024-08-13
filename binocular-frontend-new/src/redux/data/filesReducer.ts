import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Config from '../../config.ts';

export interface FilesInitialState {
  dataPluginId: number | undefined;
}

const initialState: FilesInitialState = {
  dataPluginId: undefined,
};

export const filesSlice = createSlice({
  name: 'files',
  initialState: () => {
    const storedState = localStorage.getItem(`${filesSlice.name}StateV${Config.localStorageVersion}`);
    if (storedState === null) {
      localStorage.setItem(`${filesSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(initialState));
      return initialState;
    } else {
      return JSON.parse(storedState);
    }
  },
  reducers: {
    setFilesDataPluginId: (state, action: PayloadAction<number>) => {
      state.dataPluginId = action.payload;
      localStorage.setItem(`${filesSlice.name}StateV${Config.localStorageVersion}`, JSON.stringify(state));
    },
  },
});

export const { setFilesDataPluginId } = filesSlice.actions;
export default filesSlice.reducer;
