import otherAuthorsStyles from './otherAuthors.module.scss';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../redux';
import { editAuthor, moveAuthorToOther, resetAuthor, setDragging } from '../../../../redux/reducer/data/authorsReducer.ts';
import { showContextMenu } from '../../../contextMenu/contextMenuHelper.ts';
import removeFromOtherIcon from '../../../../assets/group_remove_gray.svg';
import editIcon from '../../../../assets/edit_gray.svg';
import type { AuthorType } from '../../../../types/data/authorType.ts';
import { Icon } from '../../../icon';

function OtherAuthors(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  const authorLists = useSelector((state: RootState) => state.authors.authorLists);
  const dragging = useSelector((state: RootState) => state.authors.dragging);
  const authorsDataPluginId = useSelector((state: RootState) => state.authors.dataPluginId);
  const authors = authorLists[authorsDataPluginId] || [];

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
            .filter((a: AuthorType) => a.parent === 0)
            .map((parentAuthor: AuthorType, i: number) => {
              return (
                <div key={'author' + i}>
                  <div
                    className={
                      'flex items-center gap-2 h-auto w-full mt-1 ' +
                      (props.orientation === 'horizontal' ? otherAuthorsStyles.authorContainerHorizontal : '')
                    }>
                    <div
                      className="relative flex flex-1 items-center gap-2 px-2 py-px rounded text-sm cursor-grab overflow-hidden group hover:opacity-80 transition-opacity"
                      style={{ border: `1px solid ${parentAuthor.color.main}`, background: `${parentAuthor.color.main}0d` }}
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
                      <div className="absolute left-0 inset-y-0 w-1 flex-none" style={{ background: parentAuthor.color.main }} />
                      <Icon name="drag_indicator" className="relative flex-none opacity-40 group-hover:opacity-80 cursor-grab ml-1" />
                      <span
                        className="relative flex-1 font-semibold truncate text-sm"
                        title={parentAuthor.displayName || parentAuthor.user.gitSignature}>
                        {parentAuthor.displayName || parentAuthor.user.gitSignature}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          {authors.filter((a: AuthorType) => a.parent === 0).length === 0 && <div className={'m-1'}>No Authors in Other</div>}
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
