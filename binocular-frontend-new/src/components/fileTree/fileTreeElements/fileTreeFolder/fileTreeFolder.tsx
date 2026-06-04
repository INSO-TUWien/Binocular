import fileListElementsStyles from '../fileTreeElements.module.scss';
import { Icon } from '../../../icon';
import FileTreeFile from '../fileTreeFile/fileTreeFile';
import { type FileTreeElementType, FileTreeElementTypeType } from '../../../../types/data/fileListType';
import { formatName } from '../../utils/fileTreeUtilities';

function FileTreeFolder(props: {
  folder: FileTreeElementType;
  foldedOut: boolean;
  hideRoot?: boolean;
  listOnly?: boolean;
  showSelect: boolean;
  onShowContextMenu?: (e: React.MouseEvent<HTMLDivElement>, element: FileTreeElementType) => void;
  onElementClick?: (element: FileTreeElementType, foldOutState?: boolean) => void;
  onElementSelectionChange?: (folder: FileTreeElementType, selectionState: boolean) => void;
}) {
  if (props.hideRoot) {
    return (
      <>
        {props.folder.children &&
          props.folder.children
            .slice()
            .sort(function (e1, e2) {
              if (e1.name < e2.name) {
                return 1;
              }
              if (e1.name > e2.name) {
                return -1;
              }
              return 0;
            })
            .sort((e) => (e.type === FileTreeElementTypeType.Folder ? -1 : 1))
            .map((element, i) => {
              if (element.type === FileTreeElementTypeType.Folder && element.children) {
                return (
                  <FileTreeFolder
                    key={`fileListElement${i}`}
                    folder={element}
                    foldedOut={false}
                    listOnly={props.listOnly}
                    showSelect={props.showSelect}
                    onElementSelectionChange={props.onElementSelectionChange}
                    onElementClick={props.onElementClick}
                    onShowContextMenu={props.onShowContextMenu}></FileTreeFolder>
                );
              } else {
                return (
                  <FileTreeFile
                    key={`fileListElement${i}`}
                    file={element}
                    listOnly={props.listOnly}
                    showSelect={props.showSelect}
                    onElementClick={props.onElementClick}
                    onShowContextMenu={props.onShowContextMenu}
                    onElementSelectionChange={props.onElementSelectionChange}></FileTreeFile>
                );
              }
            })}
      </>
    );
  }

  return (
    <>
      {props.listOnly === true || props.folder.foldedOut ? (
        <>
          <div className={'flex items-center gap-1'}>
            {props.showSelect && (props.listOnly === undefined || !props.listOnly) && props.folder.id !== undefined && (
              <input
                type={'checkbox'}
                className={'checkbox checkbox-primary checkbox-xs'}
                checked={props.folder.checked}
                onChange={(e) => {
                  if (props.onElementSelectionChange !== undefined) {
                    props.onElementSelectionChange(props.folder, e.target.checked);
                  }
                }}
              />
            )}
            <div
              className={fileListElementsStyles.element}
              onClick={() => {
                if (props.onElementClick !== undefined) {
                  props.onElementClick(props.folder, false);
                }
              }}
              onContextMenu={(e) => {
                console.log(e);
                if (props.onShowContextMenu !== undefined) {
                  props.onShowContextMenu(e, props.folder);
                }
              }}>
              <Icon name="folder_open" size="w-5 h-5" />
              <span>{formatName(props.folder.searchTerm, props.folder.name)}</span>
            </div>
          </div>
          <div className={fileListElementsStyles.inset}>
            {props.folder.children &&
              props.folder.children
                .slice()
                .sort(function (e1, e2) {
                  if (e1.name < e2.name) {
                    return 1;
                  }
                  if (e1.name > e2.name) {
                    return -1;
                  }
                  return 0;
                })
                .sort((e) => (e.type === FileTreeElementTypeType.Folder ? -1 : 1))
                .map((element, i) => {
                  if (element.type === FileTreeElementTypeType.Folder && element.children) {
                    return (
                      <FileTreeFolder
                        key={`fileListElement${i}`}
                        folder={element}
                        foldedOut={false}
                        listOnly={props.listOnly}
                        showSelect={props.showSelect}
                        onElementSelectionChange={props.onElementSelectionChange}
                        onElementClick={props.onElementClick}
                        onShowContextMenu={props.onShowContextMenu}></FileTreeFolder>
                    );
                  } else {
                    return (
                      <FileTreeFile
                        key={`fileListElement${i}`}
                        file={element}
                        listOnly={props.listOnly}
                        showSelect={props.showSelect}
                        onElementClick={props.onElementClick}
                        onShowContextMenu={props.onShowContextMenu}
                        onElementSelectionChange={props.onElementSelectionChange}></FileTreeFile>
                    );
                  }
                })}
          </div>
        </>
      ) : (
        <div className={'flex items-center gap-1'}>
          {props.showSelect && (
            <input
              type={'checkbox'}
              className={'checkbox checkbox-primary checkbox-xs'}
              checked={props.folder.checked}
              onChange={(e) => {
                if (props.onElementSelectionChange !== undefined) {
                  props.onElementSelectionChange(props.folder, e.target.checked);
                }
              }}
            />
          )}
          <div
            onClick={() => {
              if (props.onElementClick !== undefined) {
                props.onElementClick(props.folder, true);
              }
            }}
            onContextMenu={(e) => {
              if (props.onShowContextMenu !== undefined) {
                props.onShowContextMenu(e, props.folder);
              }
            }}
            className={fileListElementsStyles.element}>
            <Icon name="folder" size="w-5 h-5" />
            <span>{formatName(props.folder.searchTerm, props.folder.name)}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default FileTreeFolder;
