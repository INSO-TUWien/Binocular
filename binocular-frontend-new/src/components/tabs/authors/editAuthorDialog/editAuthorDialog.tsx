import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../../redux';
import { useEffect, useState } from 'react';
import editAuthorDialogStyles from './editAuthorDialog.module.scss';
import { saveAuthor } from '../../../../redux/data/authorsReducer.ts';

function EditAuthorDialog() {
  const dispatch: AppDispatch = useAppDispatch();

  const authorToEdit = useSelector((state: RootState) => state.authors.authorToEdit);

  const [displayName, setDisplayName] = useState(authorToEdit && authorToEdit.displayName ? authorToEdit.displayName : '');
  const [colorMain, setColorMain] = useState(authorToEdit ? authorToEdit.color.main : '#CCCCC');
  const [colorSecondary, setColorSecondary] = useState(authorToEdit ? authorToEdit.color.secondary : '#CCCCC55');
  useEffect(() => {
    setDisplayName(authorToEdit && authorToEdit.displayName ? authorToEdit.displayName : '');
    setColorMain(authorToEdit ? authorToEdit.color.main : '#CCCCC');
    setColorSecondary(authorToEdit ? authorToEdit.color.secondary : '#CCCCC55');
  }, [authorToEdit]);
  return (
    <dialog id={'editAuthorDialog'} className={'modal'}>
      <div className={'modal-box'}>
        {authorToEdit && (
          <>
            <h3 id={'informationDialogHeadline'} className={'font-bold text-lg mb-2'}>
              Edit Author:
            </h3>
            <div className="label">
              <span className="label-text font-bold">Signature:</span>
            </div>
            <div className={'text-neutral-600'}>{authorToEdit.name}</div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text font-bold">Display Name:</span>
              </div>
              <input
                type="text"
                placeholder="Type here"
                value={displayName}
                className="input input-xs input-bordered w-full"
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>
            <div className="label">
              <span className="label-text font-bold">Author Color:</span>
            </div>
            <input
              type={'color'}
              className={editAuthorDialogStyles.colorPicker}
              id={'hs-color-input'}
              value={colorMain}
              style={{ borderColor: colorMain, backgroundColor: colorSecondary }}
              title={'Choose your color'}
              onChange={(event) => {
                setColorMain(event.target.value);
                setColorSecondary(event.target.value + '55');
              }}
            />
          </>
        )}

        <div className={'modal-action'}>
          <button
            className={'btn btn-sm btn-success text-base-100 mr-4'}
            onClick={() => {
              if (authorToEdit) {
                dispatch(
                  saveAuthor({
                    id: authorToEdit.id,
                    name: authorToEdit.name,
                    parent: authorToEdit.parent,
                    displayName: displayName,
                    color: {
                      main: colorMain,
                      secondary: colorSecondary,
                    },
                    selected: authorToEdit.selected,
                  }),
                );
              }
              (document.getElementById('editAuthorDialog') as HTMLDialogElement).close();
            }}>
            Save
          </button>
          <form method={'dialog'}>
            <button className={'btn btn-sm btn-accent'}>Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default EditAuthorDialog;
