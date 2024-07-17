import otherAuthorsStyles from './otherAuthors.module.scss';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../../redux';
import { editAuthor, moveAuthorToOther, resetAuthor, setDragging } from '../../../../redux/data/authorsReducer.ts';
import { showContextMenu } from '../../../contextMenu/contextMenuHelper.ts';
import removeFromOtherIcon from '../../../../assets/group_remove_black.svg';
import editIcon from '../../../../assets/edit_black.svg';

function OtherAuthors(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  const authors = useSelector((state: RootState) => state.authors.authorList);
  const dragging = useSelector((state: RootState) => state.authors.dragging);

  return (
    <div className={'text-xs'}>
      <div
        className={
          otherAuthorsStyles.authorList +
          ' ' +
          (props.orientation === 'horizontal' ? otherAuthorsStyles.authorListHorizontal : otherAuthorsStyles.authorListVertical)
        }>
        <div>
          {authors
            .filter((a) => a.parent === 0)
            .map((parentAuthor, i) => {
              return (
                <div key={'author' + i}>
                  <div className={otherAuthorsStyles.authorContainer}>
                    <div
                      style={{ borderColor: parentAuthor.color.main }}
                      className={otherAuthorsStyles.authorName}
                      draggable={true}
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
                            label: 'remove from other',
                            icon: removeFromOtherIcon,
                            function: () => dispatch(resetAuthor(parentAuthor.id)),
                          },
                        ]);
                      }}>
                      <div style={{ background: parentAuthor.color.secondary }} className={otherAuthorsStyles.authorNameBackground}></div>
                      <div className={otherAuthorsStyles.authorNameText}>{parentAuthor.displayName || parentAuthor.name}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          {authors.filter((a) => a.parent === 0).length === 0 && <div className={'m-1'}>No Authors in Other</div>}
        </div>
      </div>
      {(dragging || props.orientation === 'horizontal') && (
        <div
          className={
            otherAuthorsStyles.authorDropOther +
            ' ' +
            (props.orientation === 'horizontal' ? otherAuthorsStyles.authorDropOtherHorizontal : otherAuthorsStyles.authorDropOtherVertical)
          }
          onDrop={(event) => {
            event.stopPropagation();
            dispatch(setDragging(false));
            dispatch(moveAuthorToOther(Number(event.dataTransfer.getData('draggingAuthorId'))));
          }}
          onDragOver={(event) => event.preventDefault()}>
          <span>Drop author here to add to other!</span>
        </div>
      )}
    </div>
  );
}

export default OtherAuthors;
