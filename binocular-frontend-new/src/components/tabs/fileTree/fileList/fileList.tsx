import fileListStyles from './fileList.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux';
import { useEffect, useState } from 'react';
import { FileListElementType } from '../../../../types/data/fileListType.ts';
import { generateFileTree } from './fileListUtilities/fileTreeUtilities.ts';
import FileListFolder from './fileListElements/fileListFolder.tsx';
import { DatabaseSettingsDataPluginType } from '../../../../types/settings/databaseSettingsType.ts';
import DataPluginStorage from '../../../../utils/dataPluginStorage.ts';

function FileList(props: { orientation?: string }) {
  const currentDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  const [fileList, setFileList] = useState<FileListElementType[]>();
  const filesDataPluginId = useSelector((state: RootState) => state.files.dataPluginId);

  useEffect(() => {
    const selectedDataPlugin = currentDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.id === filesDataPluginId)[0];
    if (selectedDataPlugin && selectedDataPlugin.id !== undefined) {
      DataPluginStorage.getDataPlugin(selectedDataPlugin)
        .then((dataPlugin) => {
          if (dataPlugin) {
            dataPlugin.files
              .getAll()
              .then((files) => setFileList(generateFileTree(files)))
              .catch(() => console.log('Error loading Users from selected data source!'));
          }
        })
        .catch((e) => console.log(e));
    }
  }, [currentDataPlugins, filesDataPluginId]);

  return (
    <>
      <div
        className={
          'text-xs ' +
          fileListStyles.fileList +
          ' ' +
          (props.orientation === 'horizontal' ? fileListStyles.fileListHorizontal : fileListStyles.fileListVertical)
        }>
        <div>
          {fileList ? (
            <FileListFolder folder={fileList} name={'/'} foldedOut={true}></FileListFolder>
          ) : (
            <span className="loading loading-spinner loading-xs text-accent"></span>
          )}
        </div>
      </div>
    </>
  );
}

export default FileList;
