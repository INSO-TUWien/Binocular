import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../../redux';
import { useEffect, useState } from 'react';
import editAuthorDialogStyles from './editAuthorDialog.module.scss';
import { editAuthor, resetAuthor, saveAuthor, setParentAuthor } from '../../../../redux/data/authorsReducer.ts';
import { AuthorType } from '../../../../types/data/authorType.ts';

function EditAuthorDialog() {
  const dispatch: AppDispatch = useAppDispatch();

  const authorToEdit = useSelector((state: RootState) => state.authors.authorToEdit);
  const authors = useSelector((state: RootState) => state.authors.authorList);

  const [displayName, setDisplayName] = useState(authorToEdit && authorToEdit.displayName ? authorToEdit.displayName : '');
  const [colorMain, setColorMain] = useState(authorToEdit ? authorToEdit.color.main : '#CCCCC');
  const [colorSecondary, setColorSecondary] = useState(authorToEdit ? authorToEdit.color.secondary : '#CCCCC55');
  const [mergedAuthors, setMergedAuthors] = useState(authorToEdit && authors.filter((a: AuthorType) => a.parent === authorToEdit.id));
  const [parent, setParent] = useState(authorToEdit && authors.filter((a: AuthorType) => a.id === authorToEdit.parent)[0]);
  useEffect(() => {
    setDisplayName(authorToEdit && authorToEdit.displayName ? authorToEdit.displayName : '');
    setColorMain(authorToEdit ? authorToEdit.color.main : '#CCCCC');
    setColorSecondary(authorToEdit ? authorToEdit.color.secondary : '#CCCCC55');
    setMergedAuthors(authorToEdit && authors.filter((a: AuthorType) => a.parent === authorToEdit.id));
    setParent(authorToEdit && authors.filter((a: AuthorType) => a.id === authorToEdit.parent)[0]);
  }, [authorToEdit, authors]);
  return (
    <dialog id={'editAuthorDialog'} className={'modal'}>
      <div className={'modal-box'}>
        {authorToEdit && (
          <>
            <h3 id={'informationDialogHeadline'} className={'font-bold text-lg mb-2 underline'}>
              Edit Author
            </h3>
            <div className="label">
              <span className="label-text font-bold">Signature:</span>
            </div>
            <div className={'text-neutral-600'}>{authorToEdit.signature}</div>
            <label className="form-control w-full">
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
            {parent ? (
              <>
                <div className="label">
                  <span className="label-text font-bold">Parent:</span>
                </div>
                <div className={editAuthorDialogStyles.authorList}>
                  <div className={editAuthorDialogStyles.authorListItem} key={parent.id}>
                    <span
                      style={{ borderColor: parent.color.main, background: parent.color.secondary }}
                      className={editAuthorDialogStyles.authorName}
                      onClick={() => dispatch(editAuthor(parent?.id))}>
                      {parent.displayName || parent.signature}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="label">
                  <span className="label-text font-bold">Merged Authors:</span>
                </div>
                <div>
                  <input
                    type={'text'}
                    list="allAuthors"
                    className="input input-xs input-bordered w-full mb-2"
                    placeholder={'Add Author'}
                    onChange={(e) => {
                      if (e.target.value.length > 0) {
                        const searchedAuthors = authors.filter((a: AuthorType) => a.id === Number(e.target.value));
                        console.log(e.target.value);
                        if (searchedAuthors.length === 1) {
                          e.target.value = '';
                          dispatch(setParentAuthor({ author: searchedAuthors[0].id, parent: authorToEdit.id }));
                        }
                      }
                    }}
                  />
                  <datalist id="allAuthors">
                    {authors
                      .filter((a: AuthorType) => a.id !== authorToEdit.id)
                      .map((a: AuthorType) => (
                        <option key={a.id} value={a.id}>
                          {a.displayName || a.user.gitSignature}
                        </option>
                      ))}
                  </datalist>
                </div>
                <div className={editAuthorDialogStyles.authorList}>
                  {mergedAuthors && mergedAuthors.length > 0
                    ? mergedAuthors.map((ma: AuthorType) => (
                        <div className={editAuthorDialogStyles.authorListItem} key={ma.id}>
                          <span
                            style={{ borderColor: ma.color.main, background: ma.color.secondary }}
                            className={editAuthorDialogStyles.authorName}
                            onClick={() => dispatch(editAuthor(ma.id))}>
                            {ma.displayName || ma.user.gitSignature}
                          </span>
                          <button className={editAuthorDialogStyles.removeButton} onClick={() => dispatch(resetAuthor(ma.id))}>
                            Remove
                          </button>
                        </div>
                      ))
                    : 'No authors merged!'}
                </div>
              </>
            )}
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
                    user: authorToEdit.user,
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
