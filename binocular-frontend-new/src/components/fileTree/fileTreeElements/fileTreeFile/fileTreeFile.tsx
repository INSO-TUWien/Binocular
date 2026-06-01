import fileListElementsStyles from '../fileTreeElements.module.scss';
import { Icon } from '../../../icon';
import { formatName } from '../../utils/fileTreeUtilities';
import type { FileTreeElementType } from '../../../../types/data/fileListType';

function FileTreeFile(props: {
  file: FileTreeElementType;
  listOnly?: boolean;
  showSelect: boolean;
  onElementClick?: (element: FileTreeElementType, foldOutState?: boolean) => void;
  onShowContextMenu?: (e: React.MouseEvent<HTMLDivElement>, element: FileTreeElementType) => void;
  onElementSelectionChange?: (folder: FileTreeElementType, selectionState: boolean) => void;
}) {
  return (
    <>
      <div className={'flex items-center gap-1'}>
        {props.showSelect && (props.listOnly === undefined || !props.listOnly) && (
          <input
            type={'checkbox'}
            className={'checkbox checkbox-primary checkbox-xs'}
            checked={props.file.checked}
            onChange={(e) => {
              if (props.onElementSelectionChange !== undefined) {
                props.onElementSelectionChange(props.file, e.target.checked);
              }
            }}
          />
        )}
        <div
          className={fileListElementsStyles.element}
          onClick={() => {
            if (props.onElementClick !== undefined) {
              props.onElementClick(props.file);
            }
          }}
          onContextMenu={(e) => {
            if (props.onShowContextMenu !== undefined) {
              props.onShowContextMenu(e, props.file);
            }
          }}>
          <Icon name="file" size="w-5 h-5" />
          <span>{formatName(props.file.searchTerm, props.file.name)}</span>
        </div>
      </div>
    </>
  );
}

export default FileTreeFile;
