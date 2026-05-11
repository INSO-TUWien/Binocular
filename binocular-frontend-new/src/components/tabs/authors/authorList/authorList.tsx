import authorListStyles from './authorList.module.scss';
import authorStyles from '../authors.module.scss';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, store as globalStore, useAppDispatch } from '../../../../redux';
import {
  checkAllAuthors,
  editAuthor,
  moveAuthorToOther,
  resetAuthor,
  setAuthorList,
  setAuthorsDataPluginId,
  setDragging,
  setParentAuthor,
  switchAllAuthorSelection,
  switchAuthorSelection,
  uncheckAllAuthors,
} from '../../../../redux/reducer/data/authorsReducer.ts';
import { useEffect, useState } from 'react';
import distinctColors from 'distinct-colors';
import { showContextMenu } from '../../../contextMenu/contextMenuHelper.ts';
import addToOtherIcon from '../../../../assets/group_add_gray.svg';
import editIcon from '../../../../assets/edit_gray.svg';
import dragIndicatorIcon from '../../../../assets/drag_indicator_gray.svg';
import removePersonIcon from '../../../../assets/remove_person_gray.svg';
import checkBoxIconGray from '../../../../assets/check_box_gray.svg';
import checkBoxOutlineIconGray from '../../../../assets/check_box_outline_gray.svg';
import flipIconGray from '../../../../assets/flip_gray.svg';
import type { AuthorType } from '../../../../types/data/authorType.ts';
import type { DatabaseSettingsDataPluginType } from '../../../../types/settings/databaseSettingsType.ts';
import DataPluginStorage from '../../../../utils/dataPluginStorage.ts';
import type { DataPluginUser } from '../../../../plugins/interfaces/dataPluginInterfaces/dataPluginUsers.ts';
import type { DataPluginAccount } from '../../../../plugins/interfaces/dataPluginInterfaces/dataPluginAccounts.ts';
import { accountsSlice, setAccountList, setAccountsDataPluginId } from '../../../../redux/reducer/data/accountsReducer.ts';
import Config from '../../../../config.ts';
import type { AccountType } from '../../../../types/data/accountType.ts';

function AuthorList(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  const authorLists: { [id: number]: AuthorType[] } = useSelector((state: RootState) => state.authors.authorLists);
  const dragging = useSelector((state: RootState) => state.authors.dragging);
  const authorsDataPluginId = useSelector((state: RootState) => state.authors.dataPluginId);

  const [authors, setAuthors] = useState<AuthorType[]>(authorLists[authorsDataPluginId] || []);

  const configuredDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  function refreshAccounts(dP: DatabaseSettingsDataPluginType): Promise<void> {
    return new Promise((resolve) => {
      if (dP && dP.id !== undefined) {
        console.log(`REFRESH ACCOUNTS (${dP.name} #${dP.id})`);
        DataPluginStorage.getDataPlugin(dP)
          .then((dataPlugin) => {
            if (dataPlugin) {
              dataPlugin.accounts
                .getAll()
                .then((accounts: DataPluginAccount[]) => {
                  dispatch(
                    setAccountList({
                      dataPluginId: dP.id !== undefined ? dP.id : -1,
                      accounts: accounts.map((account) => {
                        return {
                          localId: 0, // real id gets set in reducer
                          id: account.id,
                          login: account.login,
                          name: account.name,
                          platform: account.platform,
                          user: null, // is not set, because it is not needed in the accounts list
                        };
                      }),
                    }),
                  );
                  resolve();
                })
                .catch((e) => {
                  console.log('Error loading Accounts from selected data source! ' + e);
                  resolve();
                });
            } else {
              resolve();
            }
          })
          .catch((e) => {
            console.log(e);
            resolve();
          });
      } else {
        if (configuredDataPlugins.length > 0) {
          dispatch(setAccountsDataPluginId(configuredDataPlugins[0].id));
        }
        resolve();
      }
    });
  }

  function refreshAuthors(dP: DatabaseSettingsDataPluginType) {
    if (dP && dP.id !== undefined) {
      console.log(`REFRESH AUTHORS (${dP.name} #${dP.id})`);
      const stored = localStorage.getItem(`${accountsSlice.name}StateV${Config.localStorageVersion}`);
      let accounts: AccountType[];
      if (stored) {
        accounts = JSON.parse(stored).accountLists[dP.id];
      }
      DataPluginStorage.getDataPlugin(dP)
        .then((dataPlugin) => {
          if (dataPlugin) {
            dataPlugin.users
              .getAll()
              .then((users: DataPluginUser[]) => {
                const colors = distinctColors({ count: users.length, lightMin: 50 });
                dispatch(
                  setAuthorList({
                    dataPluginId: dP.id !== undefined ? dP.id : -1,
                    authors: users.map((user, i) => {
                      if (user.account !== null && user.account !== undefined) {
                        const account = accounts.find((acc) => acc.id === user.account?.id);
                        return {
                          // mapping could be done in helper function?
                          user: {
                            account:
                              account === undefined
                                ? null
                                : {
                                    user: null,
                                    id: account.id,
                                    login: account.login,
                                    localId: account.localId,
                                    name: account.name,
                                    platform: account.platform,
                                  },
                            id: user.id,
                            gitSignature: user.gitSignature,
                          },
                          id: 0, // real id gets set in reducer
                          parent: -1,
                          color: { main: colors[i].hex(), secondary: colors[i].hex() + '55' },
                          selected: true,
                        };
                      }
                      return {
                        user: {
                          account: null,
                          id: user.id,
                          gitSignature: user.gitSignature,
                        },
                        id: 0, // real id gets set in reducer
                        parent: -1,
                        color: { main: colors[i].hex(), secondary: colors[i].hex() + '55' },
                        selected: true,
                      };
                    }),
                  }),
                );
              })
              .catch((e) => console.log('Error loading Users from selected data source! ' + e));
          }
        })
        .catch((e) => console.log(e));
    } else {
      if (configuredDataPlugins.length > 0) {
        dispatch(setAuthorsDataPluginId(configuredDataPlugins[0].id));
      }
    }
  }

  // order is needed to ensure that the authors are loaded with assigned accounts
  useEffect(() => {
    const runRefresh = async () => {
      if (configuredDataPlugins.length === 0) {
        dispatch(setAuthorsDataPluginId(undefined));
        dispatch(setAccountsDataPluginId(undefined));
        return;
      }
      const currentPluginStillExists = configuredDataPlugins.some((dP: DatabaseSettingsDataPluginType) => dP.id === authorsDataPluginId);
      if (authorsDataPluginId !== undefined && !currentPluginStillExists) {
        dispatch(setAuthorsDataPluginId(undefined));
        dispatch(setAccountsDataPluginId(undefined));
      }
      const effectiveDataPluginId = currentPluginStillExists ? authorsDataPluginId : undefined;
      for (const dP of configuredDataPlugins) {
        if (effectiveDataPluginId === undefined && dP.isDefault && dP.id !== undefined) {
          dispatch(setAuthorsDataPluginId(dP.id));
          dispatch(setAccountsDataPluginId(dP.id));
        }
        await refreshAccounts(dP);
        refreshAuthors(dP);
      }
    };
    void runRefresh();
  }, [configuredDataPlugins]);

  useEffect(() => {
    setAuthors(authorLists[authorsDataPluginId] || []);
  }, [authorLists, authorsDataPluginId]);

  globalStore.subscribe(() => {
    if (authorsDataPluginId) {
      if (globalStore.getState().actions.lastAction === 'REFRESH_PLUGIN') {
        if ((globalStore.getState().actions.payload as { pluginId: number }).pluginId === authorsDataPluginId) {
          const dP = configuredDataPlugins.filter((p: DatabaseSettingsDataPluginType) => p.id === authorsDataPluginId)[0];
          void refreshAccounts(dP).then(() => {
            refreshAuthors(dP);
          });
        }
      }
    }
  });
  return (
    <>
      <div
        className={
          'text-xs ' +
          authorListStyles.authorList +
          ' ' +
          (props.orientation === 'horizontal' ? authorListStyles.authorListHorizontal : authorListStyles.authorListVertical)
        }>
        <div className={'border-b border-base-300 pt-1'}>
          <div className="join">
            <button
              className={'btn btn-xs join-item ' + authorListStyles.checkAllButton}
              onClick={() => dispatch(checkAllAuthors())}
              title="Check all authors"></button>
            <button
              className={`btn btn-xs join-item '+ ${authorListStyles.uncheckAllButton}`}
              onClick={() => dispatch(uncheckAllAuthors())}
              title="Uncheck all authors"></button>
            <button
              className={'btn btn-xs join-item ' + authorListStyles.flipButton}
              onClick={() => dispatch(switchAllAuthorSelection())}
              title="Switch author selection"></button>
          </div>
        </div>
        <div>
          {authors
            .filter((a: AuthorType) => a.parent === -1)
            .map((parentAuthor: AuthorType, i: number) => {
              return (
                <div key={'author' + i}>
                  <div
                    className={
                      authorListStyles.authorContainer +
                      ' ' +
                      (props.orientation === 'horizontal'
                        ? authorListStyles.authorContainerHorizontal
                        : authorListStyles.authorContainerVertical)
                    }>
                    <input
                      type={'checkbox'}
                      className={'checkbox checkbox-accent ' + authorListStyles.authorCheckbox}
                      checked={parentAuthor.selected}
                      onChange={() => {
                        dispatch(switchAuthorSelection(parentAuthor.id));
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showContextMenu(e.clientX, e.clientY, [
                          {
                            label: 'check all',
                            icon: checkBoxIconGray,
                            function: () => dispatch(checkAllAuthors()),
                          },
                          {
                            label: 'uncheck all',
                            icon: checkBoxOutlineIconGray,
                            function: () => dispatch(uncheckAllAuthors()),
                          },
                          {
                            label: 'flip',
                            icon: flipIconGray,
                            function: () => dispatch(switchAllAuthorSelection()),
                          },
                        ]);
                      }}
                    />
                    <div
                      style={{ borderColor: parentAuthor.color.main }}
                      className={authorStyles.authorName}
                      draggable={true}
                      onDrop={(event) => {
                        event.stopPropagation();
                        dispatch(setDragging(false));

                        dispatch(
                          setParentAuthor({ author: Number(event.dataTransfer.getData('draggingAuthorId')), parent: parentAuthor.id }),
                        );
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={(event) => {
                        setTimeout(() => dispatch(setDragging(true), 1));
                        event.dataTransfer.setData('draggingAuthorId', String(parentAuthor.id));
                      }}
                      onDragEnd={() => dispatch(setDragging(false))}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showContextMenu(e.clientX, e.clientY, [
                          {
                            label: 'edit author',
                            icon: editIcon,
                            function: () => dispatch(editAuthor(parentAuthor.id)),
                          },
                          {
                            label: 'move to other',
                            icon: addToOtherIcon,
                            function: () => dispatch(moveAuthorToOther(parentAuthor.id)),
                          },
                        ]);
                      }}>
                      <div style={{ background: parentAuthor.color.secondary }} className={authorStyles.authorNameBackground}></div>
                      <div className={authorStyles.authorNameText}>
                        <img src={dragIndicatorIcon} alt={'drag'} />
                        <span>{parentAuthor.displayName || parentAuthor.user.gitSignature}</span>
                        <div
                          style={{
                            background: `linear-gradient(to right , ${parentAuthor.color.main}00 , ${parentAuthor.color.secondary})`,
                          }}></div>
                      </div>
                    </div>
                  </div>
                  {authors
                    .filter((a: AuthorType) => a.parent === parentAuthor.id)
                    .map((author: AuthorType, i: number) => {
                      return (
                        <div
                          key={'author' + i}
                          className={
                            authorListStyles.authorContainer +
                            ' ' +
                            (props.orientation === 'horizontal'
                              ? authorListStyles.authorContainerHorizontal
                              : authorListStyles.authorContainerVertical)
                          }>
                          {props.orientation === 'horizontal' ? (
                            <div className={authorListStyles.authorInset}></div>
                          ) : i === authors.filter((a: AuthorType) => a.parent === parentAuthor.id).length - 1 ? (
                            <div className={authorListStyles.authorInset + ' ' + authorListStyles.authorInsetEnd}></div>
                          ) : (
                            <div className={authorListStyles.authorInset + ' ' + authorListStyles.authorInsetMiddle}></div>
                          )}

                          <div
                            style={{ borderColor: author.color.main }}
                            className={authorStyles.authorName}
                            draggable={true}
                            onDragStart={(event) => {
                              setTimeout(() => dispatch(setDragging(true), 1));

                              event.dataTransfer.setData('draggingAuthorId', String(author.id));
                            }}
                            onDragEnd={() => dispatch(setDragging(false))}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              showContextMenu(e.clientX, e.clientY, [
                                {
                                  label: 'edit author',
                                  icon: editIcon,
                                  function: () => dispatch(editAuthor(author.id)),
                                },
                                {
                                  label: 'remove from parent',
                                  icon: removePersonIcon,
                                  function: () => dispatch(resetAuthor(author.id)),
                                },
                                {
                                  label: 'move to other',
                                  icon: addToOtherIcon,
                                  function: () => dispatch(moveAuthorToOther(author.id)),
                                },
                              ]);
                            }}>
                            <div style={{ background: author.color.secondary }} className={authorStyles.authorNameBackground}></div>
                            <div className={authorStyles.authorNameText}>
                              <img src={dragIndicatorIcon} alt={'drag'} />
                              <span>{author.displayName || author.user.gitSignature}</span>
                              <div
                                style={{
                                  background: `linear-gradient(to right , ${author.color.main}00 , ${author.color.secondary})`,
                                }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
        </div>
      </div>
      {(dragging || props.orientation === 'horizontal') && (
        <div
          className={
            authorListStyles.authorDropNoParent +
            ' ' +
            (props.orientation === 'horizontal'
              ? authorListStyles.authorDropNoParentHorizontal
              : authorListStyles.authorDropNoParentVertical)
          }
          onDrop={(event) => {
            event.stopPropagation();
            dispatch(setDragging(false));
            dispatch(resetAuthor(Number(event.dataTransfer.getData('draggingAuthorId'))));
          }}
          onDragOver={(event) => event.preventDefault()}>
          <span>Drop here to remove Parent!</span>
        </div>
      )}
    </>
  );
}

export default AuthorList;
