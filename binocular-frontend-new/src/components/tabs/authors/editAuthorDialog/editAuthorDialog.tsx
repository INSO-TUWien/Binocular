import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../redux';
import { useEffect, useState } from 'react';
import editAuthorDialogStyles from './editAuthorDialog.module.scss';
import {
  assignAccount,
  editAuthor,
  resetAccount,
  resetAuthor,
  saveAuthor,
  setParentAuthor,
} from '../../../../redux/reducer/data/authorsReducer.ts';
import type { AuthorType } from '../../../../types/data/authorType.ts';
import type { AccountType } from '../../../../types/data/accountType.ts';
import { showConfirmationDialog } from '../../../confirmationDialog/confirmationDialog.tsx';

function EditAuthorDialog() {
  const dispatch: AppDispatch = useAppDispatch();

  const authorToEdit = useSelector((state: RootState) => state.authors.authorToEdit);
  const authorLists = useSelector((state: RootState) => state.authors.authorLists);
  const accountLists = useSelector((state: RootState) => state.accounts.accountLists);
  const authorsDataPluginId = useSelector((state: RootState) => state.authors.dataPluginId);
  const [authors, setAuthors] = useState(authorLists[authorsDataPluginId] || []);
  // use the same dataPluginId because there is no other use for a separate one and in current use case it should be the same id
  const [accounts, setAccounts] = useState(accountLists[authorsDataPluginId] || []);

  useEffect(() => {
    setAuthors(authorLists[authorsDataPluginId] || []);
  }, [authorLists, authorsDataPluginId]);

  useEffect(() => {
    setAccounts(accountLists[authorsDataPluginId] || []);
  }, [accountLists, authorsDataPluginId]);

  const [displayName, setDisplayName] = useState(authorToEdit && authorToEdit.displayName ? authorToEdit.displayName : '');
  const [colorMain, setColorMain] = useState(authorToEdit ? authorToEdit.color.main : '#CCCCC');
  const [colorSecondary, setColorSecondary] = useState(authorToEdit ? authorToEdit.color.secondary : '#CCCCC55');
  const [mergedAuthors, setMergedAuthors] = useState(authorToEdit && authors.filter((a: AuthorType) => a.parent === authorToEdit.id));
  const [parent, setParent] = useState(authorToEdit && authors.filter((a: AuthorType) => a.id === authorToEdit.parent)[0]);
  const [assignedAccount, setAssignedAccount] = useState(
    authorToEdit ? authors.find((a: AuthorType) => a.id === authorToEdit.id)?.user.account : undefined,
  );
  useEffect(() => {
    setDisplayName(authorToEdit && authorToEdit.displayName ? authorToEdit.displayName : '');
    setColorMain(authorToEdit ? authorToEdit.color.main : '#CCCCC');
    setColorSecondary(authorToEdit ? authorToEdit.color.secondary : '#CCCCC55');
    setMergedAuthors(authorToEdit && authors.filter((a: AuthorType) => a.parent === authorToEdit.id));
    setParent(authorToEdit && authors.filter((a: AuthorType) => a.id === authorToEdit.parent)[0]);
    setAssignedAccount(authorToEdit ? authors.find((a: AuthorType) => a.id === authorToEdit.id)?.user.account : undefined);
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
            <div className={'text-base-content/60'}>{authorToEdit.user.gitSignature}</div>
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
            <div className="flex items-center gap-1 mb-2 mt-2">
              <label className="label">
                <span className="label-text font-bold">Author Color:</span>
              </label>
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
            </div>
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
                      {parent.user.displayName || parent.user.gitSignature}
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
                        const searchedAuthors = authors // Exclude the author being edited and its parent
                          .filter((a: AuthorType) => a.id !== authorToEdit.id && a.parent !== authorToEdit.id)
                          .filter((a: AuthorType) => a.id === Number(e.target.value));
                        if (searchedAuthors.length === 1) {
                          e.target.value = '';
                          dispatch(setParentAuthor({ author: searchedAuthors[0].id, parent: authorToEdit.id }));
                        }
                      }
                    }}
                  />
                  <datalist id="allAuthors">
                    {authors // Exclude the author being edited and its parent
                      .filter((a: AuthorType) => a.id !== authorToEdit.id && a.parent !== authorToEdit.id)
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
            {/* Assign Account*/}
            <div className="label">
              <span className="label-text font-bold">Assigned Account:</span>
            </div>
            <div>
              {!(assignedAccount !== undefined && assignedAccount !== null) && (
                <input
                  type={'text'}
                  list="allAccounts"
                  className="input input-xs input-bordered w-full mb-2"
                  placeholder={'Assign Account'}
                  onChange={(e) => {
                    if (e.target.value.length > 0) {
                      const searchedAccounts = accounts.filter((a: AccountType) => Number(a.localId) === Number(e.target.value));
                      if (searchedAccounts.length === 1) {
                        const isAlreadyAssigned = authors.some((a: AuthorType) => {
                          return a.user.account?.id != null && a.user.account.id === searchedAccounts[0].id && a.id !== authorToEdit.id;
                        });
                        if (isAlreadyAssigned) {
                          const rect = (e.target as HTMLInputElement).getBoundingClientRect();
                          const dialogWidth = 350;
                          const dialogHeight = 90;
                          const x = rect.left + rect.width / 2 - dialogWidth / 2 + window.scrollX;
                          const y = rect.top + rect.height / 2 + dialogHeight / 2 + window.scrollY;
                          showConfirmationDialog(
                            x,
                            y,
                            dialogWidth,
                            `This will remove the connection between this account and another author! Are you sure?`,
                            [
                              {
                                label: 'Yes',
                                icon: null,
                                function: () => dispatch(assignAccount({ account: searchedAccounts[0], author: authorToEdit.id })),
                              },
                              {
                                label: 'No',
                                icon: null,
                                function: () => {},
                              },
                            ],
                          );
                          e.target.value = '';
                          return;
                        }
                        e.target.value = '';
                        dispatch(assignAccount({ account: searchedAccounts[0], author: authorToEdit.id }));
                      }
                    }
                  }}
                />
              )}
              <datalist id="allAccounts">
                {accounts.map((a: AccountType) => (
                  <option key={a.localId} value={a.localId}>
                    {a.name || a.login}
                  </option>
                ))}
              </datalist>
            </div>
            <div className={editAuthorDialogStyles.authorList}>
              {assignedAccount !== undefined && assignedAccount !== null ? (
                <div className={editAuthorDialogStyles.authorListItem} key={assignedAccount.id}>
                  <span
                    style={{ borderColor: 'var(--color-success)', background: 'color-mix(in srgb, var(--color-success) 20%, transparent)' }}
                    className={editAuthorDialogStyles.authorName}>
                    {assignedAccount.name || assignedAccount.login}
                  </span>
                  <button className={editAuthorDialogStyles.removeButton} onClick={() => dispatch(resetAccount(assignedAccount.id))}>
                    Remove
                  </button>
                </div>
              ) : (
                'No account assigned!'
              )}
            </div>
          </>
        )}

        <div className={'modal-action'}>
          <button
            className={'btn btn-sm btn-primary mr-4'}
            onClick={() => {
              if (authorToEdit) {
                dispatch(
                  saveAuthor({
                    id: authorToEdit.id,
                    user: {
                      id: authorToEdit.user.id,
                      gitSignature: authorToEdit.user.gitSignature,
                      account: assignedAccount ? assignedAccount : null,
                    },
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

export default EditAuthorDialog;
