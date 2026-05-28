import authorListStyles from './authorList.module.scss';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, store as globalStore, useAppDispatch } from '../../../../redux';
import {
  checkAllAuthors,
  editAuthor,
  moveAuthorToOther,
  releaseAuthor,
  resetAuthor,
  setAuthorList,
  setAuthorsDataPluginId,
  setDragging,
  setDraggingSource,
  setParentAuthor,
  switchAllAuthorSelection,
  switchAuthorSelection,
  uncheckAllAuthors,
} from '../../../../redux/reducer/data/authorsReducer.ts';
import { useEffect, useState } from 'react';
import distinctColors from 'distinct-colors';
import { showContextMenu } from '../../../contextMenu/contextMenuHelper.ts';
import { Icon } from '../../../icon';
import { GroupAddIcon } from '../../../icon/icons/GroupAddIcon';
import { EditIcon } from '../../../icon/icons/EditIcon';
import { RemovePersonIcon } from '../../../icon/icons/RemovePersonIcon';
import { CheckBoxIcon } from '../../../icon/icons/CheckBoxIcon';
import { CheckBoxOutlineIcon } from '../../../icon/icons/CheckBoxOutlineIcon';
import { FlipIcon } from '../../../icon/icons/FlipIcon';
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
  const draggingSource = useSelector((state: RootState) => state.authors.draggingSource);
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
      const stored = localStorage.getItem(`bino_${accountsSlice.name}StateV${Config.localStorageVersion}`);
      let accounts: AccountType[] = [];
      if (stored) {
        accounts = JSON.parse(stored).accountLists[dP.id] ?? [];
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
        <div className={'flex items-center justify-between border-b border-base-300 pt-1 pb-1 px-1'}>
          <div className="join">
            <button className={'btn btn-xs join-item'} onClick={() => dispatch(checkAllAuthors())} title="Check all authors">
              <Icon name="check_box" size="w-4 h-4" />
            </button>
            <button className={'btn btn-xs join-item'} onClick={() => dispatch(uncheckAllAuthors())} title="Uncheck all authors">
              <Icon name="check_box_outline" size="w-4 h-4" />
            </button>
            <button className={'btn btn-xs join-item'} onClick={() => dispatch(switchAllAuthorSelection())} title="Switch author selection">
              <Icon name="flip" size="w-4 h-4" />
            </button>
          </div>
          <button
            className="btn btn-ghost btn-xs p-0.5"
            title="Author settings"
            onClick={() => window.dispatchEvent(new CustomEvent('openSettingsTab', { detail: { tab: 'Authors' } }))}>
            <Icon name="settings" size="w-4 h-4" className="opacity-50 hover:opacity-90" />
          </button>
        </div>
        <div>
          {authors.length === 0 ? (
            <p className="text-xs text-base-content/40 text-center py-4">No authors loaded.</p>
          ) : (
            authors
              .filter((a: AuthorType) => a.parent === -1)
              .map((parentAuthor: AuthorType, i: number) => {
                return (
                  <div key={'author' + i}>
                    <div
                      className={
                        'flex items-center gap-2 ' +
                        authorListStyles.authorContainer +
                        ' ' +
                        (props.orientation === 'horizontal' ? authorListStyles.authorContainerHorizontal : '')
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
                              icon: CheckBoxIcon,
                              function: () => dispatch(checkAllAuthors()),
                            },
                            {
                              label: 'uncheck all',
                              icon: CheckBoxOutlineIcon,
                              function: () => dispatch(uncheckAllAuthors()),
                            },
                            {
                              label: 'flip',
                              icon: FlipIcon,
                              function: () => dispatch(switchAllAuthorSelection()),
                            },
                          ]);
                        }}
                      />
                      <div
                        className="relative flex flex-1 items-center gap-2 px-2 py-px rounded text-sm cursor-grab overflow-hidden group hover:opacity-80 transition-opacity"
                        style={{ border: `1px solid ${parentAuthor.color.main}`, background: `${parentAuthor.color.main}0d` }}
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
                          dispatch(setDraggingSource('authors'));
                          event.dataTransfer.setData('draggingAuthorId', String(parentAuthor.id));
                        }}
                        onDragEnd={() => dispatch(setDragging(false))}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          showContextMenu(e.clientX, e.clientY, [
                            {
                              label: 'edit author',
                              icon: EditIcon,
                              function: () => dispatch(editAuthor(parentAuthor.id)),
                            },
                            {
                              label: 'move to other',
                              icon: GroupAddIcon,
                              function: () => dispatch(moveAuthorToOther(parentAuthor.id)),
                            },
                          ]);
                        }}>
                        <div className="absolute left-0 inset-y-0 w-1 flex-none" style={{ background: parentAuthor.color.main }} />
                        <Icon name="drag_indicator" className="relative flex-none opacity-40 group-hover:opacity-80 cursor-grab ml-1" />
                        <span
                          className="relative flex-1 font-semibold truncate text-sm"
                          title={parentAuthor.displayName || parentAuthor.user.gitSignature}>
                          {parentAuthor.displayName || parentAuthor.user.gitSignature}
                        </span>
                      </div>
                    </div>
                    {authors
                      .filter((a: AuthorType) => a.parent === parentAuthor.id)
                      .map((author: AuthorType, i: number, arr: AuthorType[]) => {
                        const isLast = i === arr.length - 1;
                        return (
                          <div
                            key={'author' + i}
                            className={
                              'flex items-center gap-1.5 text-xs cursor-pointer py-0 mt-px ' +
                              (props.orientation === 'horizontal' ? authorListStyles.authorContainerHorizontal : '')
                            }>
                            <div
                              className="flex-none ml-5"
                              style={{
                                width: 14,
                                alignSelf: 'stretch',
                                borderLeft: '1.5px solid var(--fallback-bc,oklch(var(--bc)/0.15))',
                                borderBottom: isLast ? '1.5px solid var(--fallback-bc,oklch(var(--bc)/0.15))' : 'none',
                                borderBottomLeftRadius: isLast ? 4 : 0,
                              }}
                            />
                            <div
                              className="relative flex-1 flex items-center gap-1.5 overflow-hidden rounded px-2 py-px hover:opacity-80 transition-opacity"
                              style={{ border: `1px solid ${author.color.main}`, background: `${author.color.main}0d` }}
                              draggable={true}
                              onDragStart={(event) => {
                                setTimeout(() => dispatch(setDragging(true), 1));
                                dispatch(setDraggingSource('authors'));
                                event.dataTransfer.setData('draggingAuthorId', String(author.id));
                              }}
                              onDragEnd={() => dispatch(setDragging(false))}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                showContextMenu(e.clientX, e.clientY, [
                                  {
                                    label: 'edit author',
                                    icon: EditIcon,
                                    function: () => dispatch(editAuthor(author.id)),
                                  },
                                  {
                                    label: 'remove from parent',
                                    icon: RemovePersonIcon,
                                    function: () => dispatch(resetAuthor(author.id)),
                                  },
                                  {
                                    label: 'move to other',
                                    icon: GroupAddIcon,
                                    function: () => dispatch(moveAuthorToOther(author.id)),
                                  },
                                ]);
                              }}>
                              <div className="absolute left-0 inset-y-0 w-1 flex-none" style={{ background: author.color.main }} />
                              <Icon name="drag_indicator" className="relative flex-none opacity-40 cursor-grab ml-1" />
                              <span
                                className="flex-1 truncate text-base-content/60 ml-1"
                                title={author.displayName || author.user.gitSignature}>
                                {author.displayName || author.user.gitSignature}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })
          )}
        </div>
      </div>
      {(dragging || props.orientation === 'horizontal') && (
        <div className="flex flex-col gap-1">
          {(draggingSource === 'authors' || props.orientation === 'horizontal') && (
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
          {draggingSource === 'other' && (
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
                dispatch(releaseAuthor(Number(event.dataTransfer.getData('draggingAuthorId'))));
              }}
              onDragOver={(event) => event.preventDefault()}>
              <span>Drop here to move back to authors!</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default AuthorList;
