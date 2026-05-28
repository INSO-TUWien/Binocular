import otherAuthorsStyles from './otherAuthors.module.scss';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../redux';
import {
  editAuthor,
  moveAuthorToOther,
  resetAuthor,
  setDragging,
  setDraggingSource,
  setParentAuthor,
} from '../../../../redux/reducer/data/authorsReducer.ts';
import { showContextMenu } from '../../../contextMenu/contextMenuHelper.ts';
import { GroupRemoveIcon } from '../../../icon/icons/GroupRemoveIcon';
import { EditIcon } from '../../../icon/icons/EditIcon';
import { RemovePersonIcon } from '../../../icon/icons/RemovePersonIcon';
import type { AuthorType } from '../../../../types/data/authorType.ts';
import { Icon } from '../../../icon';

function OtherAuthors(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  const authorLists = useSelector((state: RootState) => state.authors.authorLists);
  const dragging = useSelector((state: RootState) => state.authors.dragging);
  const draggingSource = useSelector((state: RootState) => state.authors.draggingSource);
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
                        dispatch(setDraggingSource('other'));
                        event.dataTransfer.setData('draggingAuthorId', String(parentAuthor.id));
                      }}
                      onDragEnd={() => dispatch(setDragging(false))}
                      onDrop={(event) => {
                        event.stopPropagation();
                        dispatch(setDragging(false));
                        dispatch(
                          setParentAuthor({ author: Number(event.dataTransfer.getData('draggingAuthorId')), parent: parentAuthor.id }),
                        );
                      }}
                      onDragOver={(event) => event.preventDefault()}
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
                            label: 'remove from other',
                            icon: GroupRemoveIcon,
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
                  {authors
                    .filter((a: AuthorType) => a.parent === parentAuthor.id)
                    .map((author: AuthorType, i: number, arr: AuthorType[]) => {
                      const isLast = i === arr.length - 1;
                      return (
                        <div key={'child' + i} className={'flex items-center gap-1.5 text-xs cursor-pointer py-0 mt-px'}>
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
                              dispatch(setDraggingSource('other'));
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
            })}
          {authors.filter((a: AuthorType) => a.parent === 0).length === 0 && <div className={'m-1'}>No Authors in Other</div>}
        </div>
      </div>
      {(dragging || props.orientation === 'horizontal') && (
        <div className="flex flex-col gap-1">
          {(draggingSource === 'authors' || props.orientation === 'horizontal') && (
            <div
              className={
                otherAuthorsStyles.authorDropOther +
                ' ' +
                (props.orientation === 'horizontal'
                  ? otherAuthorsStyles.authorDropOtherHorizontal
                  : otherAuthorsStyles.authorDropOtherVertical)
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
      )}
    </div>
  );
}

export default OtherAuthors;
