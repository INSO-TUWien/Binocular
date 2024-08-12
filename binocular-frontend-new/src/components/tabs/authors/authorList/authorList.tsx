import authorListStyles from './authorList.module.scss';
import authorStyles from '../authors.module.scss';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../../redux';
import {
  editAuthor,
  moveAuthorToOther,
  resetAuthor,
  setAuthorList,
  setDragging,
  setParentAuthor,
  switchAuthorSelection,
} from '../../../../redux/data/authorsReducer.ts';
import { useEffect } from 'react';
import { dataPlugins } from '../../../../plugins/pluginRegistry.ts';
import distinctColors from 'distinct-colors';
import { showContextMenu } from '../../../contextMenu/contextMenuHelper.ts';
import addToOtherIcon from '../../../../assets/group_add_black.svg';
import editIcon from '../../../../assets/edit_black.svg';
import dragIndicatorIcon from '../../../../assets/drag_indicator_gray.svg';
import removePersonIcon from '../../../../assets/remove_person_black.svg';
import { AuthorType } from '../../../../types/data/authorType.ts';
import { DatabaseSettingsDataPluginType } from '../../../../types/settings/databaseSettingsType.ts';

function AuthorList(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  const authors = useSelector((state: RootState) => state.authors.authorList);
  const dragging = useSelector((state: RootState) => state.authors.dragging);

  const currentDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);

  useEffect(() => {
    const defaultDataPlugin = currentDataPlugins.filter((dP: DatabaseSettingsDataPluginType) => dP.isDefault)[0];
    if (defaultDataPlugin) {
      dataPlugins.filter((plugin) => plugin.name === defaultDataPlugin.name)[0].setApiKey(defaultDataPlugin.parameters.apiKey);
      dataPlugins
        .filter((plugin) => plugin.name === defaultDataPlugin.name)[0]
        .users.getAll()
        .then((users) => {
          const colors = distinctColors({ count: users.length, lightMin: 50 });
          dispatch(
            setAuthorList(
              users.map((user, i) => {
                return {
                  user: user,
                  id: 0, // real id gets set in reducer
                  parent: -1,
                  color: { main: colors[i].hex(), secondary: colors[i].hex() + '55' },
                  selected: true,
                };
              }),
            ),
          );
        })
        .catch(() => console.log('Error loading Users from selected data source!'));
    }
  }, [currentDataPlugins]);

  return (
    <>
      <div
        className={
          'text-xs ' +
          authorListStyles.authorList +
          ' ' +
          (props.orientation === 'horizontal' ? authorListStyles.authorListHorizontal : authorListStyles.authorListVertical)
        }>
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
                      defaultChecked={parentAuthor.selected}
                      onChange={() => dispatch(switchAuthorSelection(parentAuthor.id))}
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
