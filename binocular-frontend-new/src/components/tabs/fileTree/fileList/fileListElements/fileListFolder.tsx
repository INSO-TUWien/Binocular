import fileListElementsStyles from './fileListElements.module.scss';
import { FileListElementType, FileListElementTypeType } from '../../../../../types/data/fileListType.ts';
import { useState } from 'react';
import FolderIcon from '../../../../../assets/folder_black.svg';
import FolderOpenIcon from '../../../../../assets/folder_open_black.svg';
import FileListFile from './fileListFile.tsx';

function FileListFolder(props: { folder: FileListElementType[]; name: string; foldedOut: boolean }) {
  const [foldedOut, setFoldedOut] = useState(props.foldedOut);
  return (
    <>
      {foldedOut ? (
        <>
          <div className={fileListElementsStyles.element} onClick={() => setFoldedOut(false)}>
            <img src={FolderOpenIcon} alt={`folder open ${props.name}`} />
            <span>{props.name}</span>
          </div>
          <div className={fileListElementsStyles.inset}>
            {props.folder
              .sort((e) => (e.type === FileListElementTypeType.Folder ? -1 : 1))
              .map((element, i) => {
                if (element.type === FileListElementTypeType.Folder && element.children) {
                  return (
                    <FileListFolder
                      key={`fileListElement${i}`}
                      folder={element.children}
                      name={element.name}
                      foldedOut={false}></FileListFolder>
                  );
                } else {
                  return <FileListFile key={`fileListElement${i}`} file={element}></FileListFile>;
                }
              })}
          </div>
        </>
      ) : (
        <div onClick={() => setFoldedOut(true)} className={fileListElementsStyles.element}>
          <img src={FolderIcon} alt={`folder ${props.name}`} />
          <span>{props.name}</span>
        </div>
      )}
    </>
  );
}

export default FileListFolder;
