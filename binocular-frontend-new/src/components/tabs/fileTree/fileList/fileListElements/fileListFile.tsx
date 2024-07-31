import fileListElementsStyles from './fileListElements.module.scss';
import { FileListElementType } from '../../../../../types/data/fileListType.ts';
import FileIcon from '../../../../../assets/file_black.svg';

function FileListFile(props: { file: FileListElementType }) {
  return (
    <>
      <div className={fileListElementsStyles.element}>
        <img src={FileIcon} alt={`folder ${props.file.name}`} />
        <span>{props.file.name}</span>
      </div>
    </>
  );
}

export default FileListFile;
