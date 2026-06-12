import { useState } from 'react';
import FileSearch from './fileSearch/fileSearch.tsx';
import FileList from './fileList/fileList.tsx';
import HorizontalExpand from '../shared/horizontalExpand.tsx';

function FileTree(props: { orientation?: string }) {
  const [fileSearch, setFileSearch] = useState('');

  return (
    <HorizontalExpand
      orientation={props.orientation}
      label="File Tree"
      verticalContent={
        <>
          <FileSearch setFileSearch={setFileSearch} />
          <FileList search={fileSearch} orientation={props.orientation} />
        </>
      }
      overlayContent={
        <>
          <div className="flex-none p-2 border-b border-base-300">
            <FileSearch setFileSearch={setFileSearch} />
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            <FileList search={fileSearch} orientation="vertical" />
          </div>
        </>
      }
    />
  );
}

export default FileTree;
