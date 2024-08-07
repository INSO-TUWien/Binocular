import fileListStyles from './fileList.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux';
import { useEffect, useState } from 'react';
import { dataPlugins } from '../../../../plugins/pluginRegistry.ts';
import { FileListElementType } from '../../../../types/data/fileListType.ts';
import { generateFileTree } from './fileListUtilities/fileTreeUtilities.ts';
import FileListFolder from './fileListElements/fileListFolder.tsx';

function FileList(props: { orientation?: string }) {
  const currentDataPlugin = useSelector((state: RootState) => state.settings.dataPlugin);

  const [fileList, setFileList] = useState<FileListElementType[]>();

  useEffect(() => {
    dataPlugins.filter((plugin) => plugin.name === currentDataPlugin.name)[0].setApiKey(currentDataPlugin.parameters.apiKey);
    dataPlugins
      .filter((plugin) => plugin.name === currentDataPlugin.name)[0]
      .files.getAll()
      .then((files) => setFileList(generateFileTree(files)))
      .catch(() => console.log('Error loading Users from selected data source!'));
  }, [currentDataPlugin.name]);

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
