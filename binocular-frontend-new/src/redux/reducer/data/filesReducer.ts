import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FileListElementType, FileTreeElementType } from '../../../types/data/fileListType.ts';
import { writeFileListToStorage } from '../../../components/tabs/fileTree/utils/fileListUtilities';
import { invertFileTreeSelection, updateFileTreeRecursive } from '../../../components/fileTree/utils/fileTreeUtilities';

export interface FilesInitialState {
  fileTrees: { [id: number]: FileTreeElementType };
  fileLists: { [id: number]: FileListElementType[] };
  fileCounts: { [id: number]: number };
  dataPluginId: number | undefined;
  selectedFileTreeElement?: FileTreeElementType;
  initialized: boolean;
}

const initialState: FilesInitialState = {
  fileTrees: {},
  fileLists: {},
  fileCounts: {},
  dataPluginId: undefined,
  selectedFileTreeElement: undefined,
  initialized: false,
};

export const filesSlice = createSlice({
  name: 'files',
  initialState: () => {
    return initialState;
  },
  reducers: {
    loadState: (state, action: PayloadAction<FilesInitialState | undefined>) => {
      if (action.payload != undefined) {
        state.fileCounts = action.payload.fileCounts;
        state.fileTrees = action.payload.fileTrees;
        state.fileLists = action.payload.fileLists;
        state.dataPluginId = action.payload.dataPluginId;
      }
      state.initialized = true;
    },
    setFileList: (state, action: PayloadAction<{ dataPluginId: number; fileTree: FileTreeElementType; files: FileListElementType[] }>) => {
      state.fileTrees[action.payload.dataPluginId] = action.payload.fileTree;
      state.fileCounts[action.payload.dataPluginId] = action.payload.files.length;
      state.fileLists[action.payload.dataPluginId] = action.payload.files;

      const newState = JSON.stringify(state);
      writeFileListToStorage(newState);
    },
    setFilesDataPluginId: (state, action: PayloadAction<number>) => {
      state.dataPluginId = action.payload;
      const newState = JSON.stringify(state);
      writeFileListToStorage(newState);
    },
    updateFileListElement: (state, action: PayloadAction<FileTreeElementType & { update?: boolean }>) => {
      const updatedPaths: string[] = updateFileTreeRecursive(state.fileTrees[state.dataPluginId!], action.payload);
      if (action.payload.update) {
        state.fileLists[state.dataPluginId!] = state.fileLists[state.dataPluginId!].map((f: FileListElementType) => {
          if (updatedPaths.includes(f.element.path)) {
            f.checked = action.payload.checked;
          }
          return f;
        });
        const newState = JSON.stringify(state);
        writeFileListToStorage(newState);
      }
    },
    showFileTreeElementInfo: (state, action: PayloadAction<FileTreeElementType>) => {
      (document.getElementById('fileTreeElementInfoDialog') as HTMLDialogElement).showModal();
      state.selectedFileTreeElement = action.payload;
    },
    checkAllFiles: (state) => {
      state.fileLists[state.dataPluginId!] = state.fileLists[state.dataPluginId!].map((f: FileListElementType) => {
        f.checked = true;
        return f;
      });
      updateFileTreeRecursive(state.fileTrees[state.dataPluginId!], state.fileTrees[state.dataPluginId!], true);
      const newState = JSON.stringify(state);
      writeFileListToStorage(newState);
    },
    uncheckAllFiles: (state) => {
      updateFileTreeRecursive(state.fileTrees[state.dataPluginId!], state.fileTrees[state.dataPluginId!], false);
      state.fileLists[state.dataPluginId!] = state.fileLists[state.dataPluginId!].map((f: FileListElementType) => {
        f.checked = false;
        return f;
      });
      const newState = JSON.stringify(state);
      writeFileListToStorage(newState);
    },
    switchAllFileSelection: (state) => {
      state.fileLists[state.dataPluginId!] = state.fileLists[state.dataPluginId!].map((f: FileListElementType) => {
        f.checked = !f.checked;
        return f;
      });
      invertFileTreeSelection(state.fileTrees[state.dataPluginId!]);
      const newState = JSON.stringify(state);
      writeFileListToStorage(newState);
    },
    removeFileList: (state, action: PayloadAction<number>) => {
      delete state.fileLists[action.payload];
      delete state.fileTrees[action.payload];
      delete state.fileCounts[action.payload];
      const newState = JSON.stringify(state);
      writeFileListToStorage(newState);
    },
    removeFileList: (state, action: PayloadAction<number>) => {
      delete state.fileLists[action.payload];
      delete state.fileTrees[action.payload];
      delete state.fileCounts[action.payload];
      const newState = JSON.stringify(state);
      fileHandle.createWritable().then((access) => access.write(newState).then(() => access.close()));
    },
    clearFileStorage: () => {
      clearFileStorage();
    },
  },
});

export const {
  setFilesDataPluginId,
  setFileList,
  updateFileListElement,
  showFileTreeElementInfo,
  removeFileList,
  clearFileStorage,
  loadState,
  checkAllFiles,
  uncheckAllFiles,
  switchAllFileSelection,
} = filesSlice.actions;
export default filesSlice.reducer;
