import type { DataPluginFile } from '../../../../plugins/interfaces/dataPluginInterfaces/dataPluginFiles';
import { FileTreeElementTypeType } from '../../../../types/data/fileListType';
import type { DatabaseSettingsDataPluginType } from '../../../../types/settings/databaseSettingsType';
import type { AppDispatch } from '../../../../redux';
import DataPluginStorage from '../../../../utils/dataPluginStorage';
import { loadState, setFileList } from '../../../../redux/reducer/data/filesReducer';
import { generateFileTree } from '../../../fileTree/utils/fileTreeUtilities';

let opfsRoot: FileSystemDirectoryHandle | undefined = undefined;
let fileHandle: FileSystemFileHandle | undefined = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  opfsRoot = await navigator.storage.getDirectory();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  fileHandle = await opfsRoot.getFileHandle('files', { create: true });
} catch (e) {
  console.log('Could not access OPFS', e);
}

export function loadFileList(dispatch: AppDispatch) {
  if (fileHandle)
    fileHandle.getFile().then((files) => {
      if (files !== null) {
        files.text().then(
          (list) => {
            dispatch(loadState(list != '' ? JSON.parse(list) : undefined));
          },
          (error) => {
            console.log('Could not access files', error);
            dispatch(loadState(undefined));
          },
        );
      }
    });
  else dispatch(loadState(undefined));
}

export function refreshFileList(dP: DatabaseSettingsDataPluginType, dispatch: AppDispatch) {
  if (dP && dP.id !== undefined) {
    console.log(`REFRESH FILES (${dP.name} #${dP.id})`);
    DataPluginStorage.getDataPlugin(dP)
      .then((dataPlugin) => {
        if (dataPlugin) {
          dataPlugin.files
            .getAll()
            .then((files) =>
              dispatch(
                setFileList({
                  dataPluginId: dP.id !== undefined ? dP.id : -1,
                  fileTree: {
                    name: '/',
                    type: FileTreeElementTypeType.Folder,
                    children: generateFileTree(files),
                    checked: true,
                    foldedOut: true,
                    isRoot: true,
                  },
                  files: files.map((f: DataPluginFile) => {
                    return {
                      element: f,
                      checked: true,
                    };
                  }),
                }),
              ),
            )
            .catch((e) => console.log('Error loading Files from selected data source!', e));
        }
      })
      .catch((e) => console.log(e));
  }
}

export function writeFileListToStorage(filesState: string) {
  if (fileHandle) fileHandle.createWritable().then((access) => access.write(filesState).then(() => access.close()));
}

export function clearStorage() {
  if (opfsRoot) opfsRoot.removeEntry('files');
}
