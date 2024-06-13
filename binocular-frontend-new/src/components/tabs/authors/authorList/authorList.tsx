import authorListStyles from './authorList.module.scss';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../../redux';
import { setAuthorList, setDragging } from '../../../../redux/authorsReducer.ts';
import { useEffect } from 'react';
import { dataPlugins } from '../../../../plugins/pluginRegistry.ts';
import distinctColors from 'distinct-colors';
function AuthorList(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  const authors = useSelector((state: RootState) => state.authors.authorList);
  const dragging = useSelector((state: RootState) => state.authors.dragging);

  const currentDataPlugin = useSelector((state: RootState) => state.settings.dataPlugin);

  useEffect(() => {
    dataPlugins
      .filter((plugin) => plugin.name === currentDataPlugin)[0]
      .authors.getAll()
      .then((authors) => {
        const colors = distinctColors({ count: authors.length, lightMin: 50 });
        dispatch(
          setAuthorList(
            authors.map((author, i) => {
              return {
                name: author.gitSignature,
                id: i + 1,
                parent: -1,
                color: { main: colors[i].hex(), secondary: colors[i].hex() + '55' },
                selected: true,
              };
            }),
          ),
        );
      })
      .catch(() => console.log('Error loading Authors from selected data source!'));
  }, [currentDataPlugin]);

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
            .filter((a) => a.parent === -1)
            .map((parentAuthor, i) => {
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
                      onChange={(e) =>
                        dispatch(
                          setAuthorList(
                            authors.map((a) => {
                              if (a.id === parentAuthor.id) {
                                return { name: a.name, id: a.id, color: a.color, parent: a.parent, selected: e.target.checked };
                              }
                              return a;
                            }),
                          ),
                        )
                      }
                    />
                    <div
                      style={{ borderColor: parentAuthor.color.main }}
                      className={authorListStyles.authorName}
                      draggable={true}
                      onDrop={(event) => {
                        event.stopPropagation();
                        dispatch(setDragging(false));

                        dispatch(
                          setAuthorList(
                            authors.map((a) => {
                              if (parentAuthor.id !== Number(event.dataTransfer.getData('draggingAuthorId'))) {
                                if (a.parent === Number(event.dataTransfer.getData('draggingAuthorId'))) {
                                  return { name: a.name, id: a.id, color: a.color, parent: parentAuthor.id, selected: a.selected };
                                }
                                if (a.id === Number(event.dataTransfer.getData('draggingAuthorId'))) {
                                  return { name: a.name, id: a.id, color: a.color, parent: parentAuthor.id, selected: a.selected };
                                }
                              }
                              return a;
                            }),
                          ),
                        );
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={(event) => {
                        setTimeout(() => dispatch(setDragging(true), 1));
                        event.dataTransfer.setData('draggingAuthorId', String(parentAuthor.id));
                      }}
                      onDragEnd={() => dispatch(setDragging(false))}>
                      <div style={{ background: parentAuthor.color.secondary }} className={authorListStyles.authorNameBackground}></div>
                      <div className={authorListStyles.authorNameText}>{parentAuthor.name}</div>
                    </div>
                  </div>
                  {authors
                    .filter((a) => a.parent === parentAuthor.id)
                    .map((author, i) => {
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
                          ) : i === authors.filter((a) => a.parent === parentAuthor.id).length - 1 ? (
                            <div className={authorListStyles.authorInset + ' ' + authorListStyles.authorInsetEnd}></div>
                          ) : (
                            <div className={authorListStyles.authorInset + ' ' + authorListStyles.authorInsetMiddle}></div>
                          )}

                          <div
                            style={{ borderColor: author.color.main }}
                            className={authorListStyles.authorName}
                            draggable={true}
                            onDragStart={(event) => {
                              setTimeout(() => dispatch(setDragging(true), 1));

                              event.dataTransfer.setData('draggingAuthorId', String(author.id));
                            }}
                            onDragEnd={() => dispatch(setDragging(false))}>
                            <div style={{ background: author.color.secondary }} className={authorListStyles.authorNameBackground}></div>
                            <div className={authorListStyles.authorNameText}>{author.name}</div>
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
            dispatch(
              setAuthorList(
                authors.map((a) => {
                  if (a.parent === Number(event.dataTransfer.getData('draggingAuthorId'))) {
                    return { name: a.name, id: a.id, color: a.color, parent: -1, selected: a.selected };
                  }
                  if (a.id === Number(event.dataTransfer.getData('draggingAuthorId'))) {
                    return { name: a.name, id: a.id, color: a.color, parent: -1, selected: a.selected };
                  }
                  return a;
                }),
              ),
            );
          }}
          onDragOver={(event) => event.preventDefault()}>
          <span>Drop here to remove Parent!</span>
        </div>
      )}
    </>
  );
}

export default AuthorList;
