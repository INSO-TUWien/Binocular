import fileListStyles from './fileList.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux';
import { useEffect, useState } from 'react';
import { dataPlugins } from '../../../../plugins/pluginRegistry.ts';
import { FileListElementType } from '../../../../types/data/fileListType.ts';
import { generateFileTree } from './fileListUtilities/fileTreeUtilities.ts';
import FileListFolder from './fileListElements/fileListFolder.tsx';
import { DatabaseSettingsDataPluginType } from '../../../../types/settings/databaseSettingsType.ts';

function FileList(props: { orientation?: string }) {
  const currentDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  const [fileList, setFileList] = useState<FileListElementType[]>();
  const filesDataPluginId = useSelector((state: RootState) => state.files.dataPluginId);

  useEffect(() => {
    const selectedDataPlugin = currentDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.id === filesDataPluginId)[0];
    if (selectedDataPlugin) {
      dataPlugins.filter((plugin) => plugin.name === selectedDataPlugin.name)[0].setApiKey(selectedDataPlugin.parameters.apiKey);
      dataPlugins
        .filter((plugin) => plugin.name === selectedDataPlugin.name)[0]
        .files.getAll()
        .then((files) => setFileList(generateFileTree(files)))
        .catch(() => console.log('Error loading Users from selected data source!'));
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
