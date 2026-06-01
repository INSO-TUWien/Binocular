import { useSelector } from 'react-redux';
import { useState } from 'react';
import FileTreeElementInfoDialogStyled from './fileTreeElementInfoDialog.module.scss';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../redux';
import { type FileTreeElementType, FileTreeElementTypeType } from '../../../types/data/fileListType';
import FileSearch from '../../tabs/fileTree/fileSearch/fileSearch';
import FileTreeFolder from '../fileTreeElements/fileTreeFolder/fileTreeFolder';
import { filterFileTree } from '../utils/fileTreeUtilities';
import { showFileTreeElementInfo } from '../../../redux/reducer/data/filesReducer';

function FileTreeElementInfoDialog() {
  const dispatch: AppDispatch = useAppDispatch();

  const selectedFileTreeElement: FileTreeElementType | undefined = useSelector((state: RootState) => state.files.selectedFileTreeElement);
  const [fileSearch, setFileSearch] = useState('');

  return (
    <dialog id={'fileTreeElementInfoDialog'} className={'modal'}>
      <div className={'modal-box'}>
        {selectedFileTreeElement && (
          <>
            <h3 id={'informationDialogHeadline'} className={'font-bold text-lg mb-2 underline'}>
              {selectedFileTreeElement.name}
            </h3>
            <h2>Type</h2>
            <div>{selectedFileTreeElement.type}</div>

            <h2>File Tree State</h2>
            <div>
              <span className={'mr-2'}>
                {selectedFileTreeElement.foldedOut ? (
                  <div className="badge badge-primary">folded out</div>
                ) : (
                  <div className="badge badge-primary badge-outline">folded in</div>
                )}
              </span>
              <span className={'mr-2'}>
                {selectedFileTreeElement.checked ? (
                  <div className="badge badge-primary">checked</div>
                ) : (
                  <div className="badge badge-primary badge-outline">unchecked</div>
                )}
              </span>
            </div>

            {selectedFileTreeElement.type === FileTreeElementTypeType.File && selectedFileTreeElement.element && (
              <>
                <h2>Path</h2>
                <div>{selectedFileTreeElement.element.path}</div>
                <h2>Max Length</h2>
                <div>{selectedFileTreeElement.element.maxLength}</div>
                <h2>Url</h2>
                <div>
                  <a href={selectedFileTreeElement.element.webUrl} target="_blank" rel="noreferrer">
                    {selectedFileTreeElement.element.webUrl}
                  </a>
                </div>
              </>
            )}

            {selectedFileTreeElement.type === FileTreeElementTypeType.Folder && (
              <>
                <h2>Folder Content</h2>
                <FileSearch setFileSearch={setFileSearch}></FileSearch>
                <div className={FileTreeElementInfoDialogStyled.FolderContentContainer}>
                  <FileTreeFolder
                    folder={filterFileTree(selectedFileTreeElement, fileSearch)}
                    foldedOut={true}
                    listOnly={true}
                    showSelect={false}
                    onElementClick={(folder) => {
                      dispatch(showFileTreeElementInfo(folder));
                    }}></FileTreeFolder>
                </div>
              </>
            )}
          </>
        )}

        <div className={'modal-action'}>
          <form method={'dialog'}>
            <button className={'btn btn-sm btn-ghost'}>Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default FileTreeElementInfoDialog;
