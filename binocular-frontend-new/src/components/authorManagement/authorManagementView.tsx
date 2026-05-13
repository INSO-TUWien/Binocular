import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, useAppDispatch } from '../../redux';
import {
  editAuthor,
  moveAuthorToOther,
  resetAuthor,
  setAuthorsDataPluginId,
  setDragging,
  setParentAuthor,
} from '../../redux/reducer/data/authorsReducer.ts';
import type { AuthorType } from '../../types/data/authorType.ts';
import type { AccountType } from '../../types/data/accountType.ts';
import type { DatabaseSettingsDataPluginType } from '../../types/settings/databaseSettingsType.ts';
import dragIndicatorIcon from '../../assets/drag_indicator_gray.svg';
import groupRemoveIcon from '../../assets/group_remove_gray.svg';
import ColorCodedPanel from '../colorCodedPanel/colorCodedPanel.tsx';

type Filter = 'all' | 'matched' | 'unmatched';
type AccountWithLogin = AccountType & { login?: string };

function AccountBadge({ account }: { account: AccountWithLogin | null }) {
  if (!account) {
    return null;
  }
  const label = account.name || account.login || account.id;
  return (
    <span className="badge badge-sm badge-outline text-xs gap-1 whitespace-nowrap">
      <span className="capitalize opacity-60">{account.platform}</span>
      <span className="opacity-30">·</span>
      <span>{label}</span>
    </span>
  );
}

interface AuthorGroupCellProps {
  author: AuthorType;
  subAuthors: AuthorType[];
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  onChildDragStart: (e: React.DragEvent, childId: number) => void;
  onChildClick: (childId: number) => void;
  onUngroup: () => void;
  onClick: () => void;
}

function AuthorGroupCell({
  author,
  subAuthors,
  onDragStart,
  onDragEnd,
  onDrop,
  onChildDragStart,
  onChildClick,
  onUngroup,
  onClick,
}: AuthorGroupCellProps) {
  return (
    <div>
      {/* Parent row */}
      <div
        className="relative flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer overflow-hidden group hover:opacity-80 transition-opacity"
        style={{ border: `1px solid ${author.color.main}` }}
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={(e) => {
          e.stopPropagation();
          onDrop(e);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={onClick}>
        <div className="absolute left-0 inset-y-0 w-1 flex-none" style={{ background: author.color.main }} />
        <img src={dragIndicatorIcon} alt="drag" className="relative flex-none w-4 opacity-40 group-hover:opacity-80 cursor-grab ml-1" />
        <span className="relative flex-1 font-semibold truncate text-sm" title={author.displayName || author.user.gitSignature}>
          {author.displayName || author.user.gitSignature}
        </span>
        <AccountBadge account={author.user.account as AccountWithLogin} />
        {subAuthors.length > 0 && (
          <button
            className="relative flex-none btn btn-ghost btn-xs p-0 w-5 h-5 min-h-0 opacity-40 hover:opacity-90"
            title="Remove all subauthors"
            onClick={(e) => {
              e.stopPropagation();
              onUngroup();
            }}>
            <img src={groupRemoveIcon} alt="ungroup" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Child rows */}
      {subAuthors.map((child, i) => {
        const isLast = i === subAuthors.length - 1;
        return (
          <div
            key={child.id}
            className="flex items-center gap-1.5 text-xs cursor-pointer py-0.5"
            draggable={true}
            onDragStart={(e) => onChildDragStart(e, child.id)}
            onDragEnd={onDragEnd}
            onClick={() => onChildClick(child.id)}>
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
              className="relative flex-1 flex items-center gap-1.5 overflow-hidden rounded px-2 py-0.5 hover:opacity-80 transition-opacity"
              style={{ border: `1px solid ${child.color.main}` }}>
              <div className="absolute left-0 inset-y-0 w-1 flex-none" style={{ background: child.color.main }} />
              <span className="flex-1 truncate text-base-content/60 ml-1" title={child.displayName || child.user.gitSignature}>
                {child.displayName || child.user.gitSignature}
              </span>
              <AccountBadge account={child.user.account as AccountWithLogin} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AuthorManagementView() {
  const dispatch: AppDispatch = useAppDispatch();
  const authorLists = useSelector((state: RootState) => state.authors.authorLists);
  const dataPluginId = useSelector((state: RootState) => state.authors.dataPluginId);
  const dragging = useSelector((state: RootState) => state.authors.dragging);
  const availableDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);
  const selectedDataPlugin = availableDataPlugins.find((dP: DatabaseSettingsDataPluginType) => dP.id === dataPluginId);
  const [filter, setFilter] = useState<Filter>('all');
  const [otherExpanded, setOtherExpanded] = useState(false);

  const authors: AuthorType[] = (dataPluginId !== undefined ? authorLists[dataPluginId] : undefined) || [];

  if (authors.length === 0) {
    return (
      <div role="alert" className="alert alert-info mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          No authors loaded. Make sure a data source is connected in <strong>Settings → Database</strong>.
        </span>
      </div>
    );
  }

  const topLevel = authors.filter((a) => a.parent === -1);
  const otherAuthors = authors.filter((a) => a.parent === 0);

  const matchedCount = topLevel.filter((a) => a.user.account != null).length;
  const unmatchedCount = topLevel.length - matchedCount;

  const filteredTopLevel = topLevel
    .filter((a) => {
      if (filter === 'matched') return a.user.account != null;
      if (filter === 'unmatched') return a.user.account == null;
      return true;
    })
    .sort((a, b) => {
      const nameA = (a.displayName || a.user.gitSignature).toLowerCase();
      const nameB = (b.displayName || b.user.gitSignature).toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const filterBtnClass = (f: Filter) => 'btn btn-xs join-item' + (filter === f ? ' btn-neutral' : '');

  function handleDragStart(e: React.DragEvent, authorId: number) {
    setTimeout(() => dispatch(setDragging(true)));
    e.dataTransfer.setData('draggingAuthorId', String(authorId));
  }

  function handleDrop(e: React.DragEvent, targetId: number) {
    dispatch(setDragging(false));
    const draggedId = Number(e.dataTransfer.getData('draggingAuthorId'));
    if (draggedId !== targetId) {
      dispatch(setParentAuthor({ author: draggedId, parent: targetId }));
    }
  }

  function renderGrid(items: AuthorType[]) {
    const leftCol = items.filter((_, i) => i % 2 === 0);
    const rightCol = items.filter((_, i) => i % 2 === 1);

    const renderCol = (col: AuthorType[]) => (
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {col.map((author) => (
          <AuthorGroupCell
            key={author.id}
            author={author}
            subAuthors={authors.filter((a) => a.parent === author.id)}
            onDragStart={(e) => handleDragStart(e, author.id)}
            onDragEnd={() => dispatch(setDragging(false))}
            onDrop={(e) => handleDrop(e, author.id)}
            onChildDragStart={(e, childId) => handleDragStart(e, childId)}
            onChildClick={(childId) => dispatch(editAuthor(childId))}
            onUngroup={() => dispatch(resetAuthor(author.id))}
            onClick={() => dispatch(editAuthor(author.id))}
          />
        ))}
      </div>
    );

    return (
      <div className="flex gap-4">
        {renderCol(leftCol)}
        {renderCol(rightCol)}
      </div>
    );
  }

  function handleZoneDrop(e: React.DragEvent, action: (id: number) => void) {
    e.stopPropagation();
    dispatch(setDragging(false));
    action(Number(e.dataTransfer.getData('draggingAuthorId')));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Data plugin selector */}
      <div className="flex flex-wrap gap-3">
        {availableDataPlugins.map((dP: DatabaseSettingsDataPluginType) => (
          <ColorCodedPanel
            key={`authorPlugin${dP.id}`}
            color={dP.color}
            isSelected={selectedDataPlugin?.id === dP.id}
            onSelect={() => {
              if (dP.id !== undefined) dispatch(setAuthorsDataPluginId(dP.id));
            }}
            selectable
            className="w-52">
            <p className="card-title text-sm justify-center w-full !mb-0">
              {dP.name} #{dP.id}
            </p>
            <div className="flex flex-wrap gap-1">{dP.id === 0 && <div className="badge badge-outline badge-sm">pre-loaded</div>}</div>
            {dP.parameters?.endpoint && (
              <div className="text-xs">
                <span className="font-bold">Endpoint: </span>
                <span>{dP.parameters.endpoint}</span>
              </div>
            )}
            {dP.parameters?.fileName && (
              <div className="text-xs">
                <span className="font-bold">Database: </span>
                <span>{dP.parameters.fileName}</span>
              </div>
            )}
          </ColorCodedPanel>
        ))}
      </div>

      {/* Stats + filter bar */}
      <div className="flex items-center gap-3 text-sm flex-wrap">
        <span className="text-base-content/50">{topLevel.length} authors</span>
        <span className="badge badge-success badge-sm">{matchedCount} matched</span>
        <span className="badge badge-warning badge-sm">{unmatchedCount} unmatched</span>
        <div className="join ml-auto">
          <button className={filterBtnClass('all')} onClick={() => setFilter('all')}>
            All
          </button>
          <button className={filterBtnClass('matched')} onClick={() => setFilter('matched')}>
            Matched
          </button>
          <button className={filterBtnClass('unmatched')} onClick={() => setFilter('unmatched')}>
            Unmatched
          </button>
        </div>
      </div>

      {/* Author grid */}
      {filteredTopLevel.length > 0 ? (
        renderGrid(filteredTopLevel)
      ) : (
        <div className="text-base-content/40 text-sm px-3 py-6 text-center">No authors match the current filter.</div>
      )}

      {/* Other section */}
      {otherAuthors.length > 0 && (
        <div className="border-t border-base-300 pt-1">
          <button
            className="flex items-center gap-2 text-xs text-base-content/50 hover:text-base-content px-3 py-1 w-full text-left"
            onClick={() => setOtherExpanded((v) => !v)}>
            <span>{otherExpanded ? '▼' : '▶'}</span>
            <span>Other ({otherAuthors.length})</span>
          </button>
          {otherExpanded && renderGrid(otherAuthors)}
        </div>
      )}
      {/* Drop zones — sticky to bottom of scroll container while dragging */}
      {dragging && (
        <div className="sticky bottom-0 flex gap-3 bg-base-100 border-t border-base-300 pt-3 pb-2 z-10">
          <div
            className="flex-1 border-2 border-dashed border-error/50 bg-error/10 rounded-lg text-sm font-medium text-error text-center px-4 py-4 transition-colors hover:bg-error/20 hover:border-error cursor-copy"
            onDrop={(e) => handleZoneDrop(e, (id) => dispatch(resetAuthor(id)))}
            onDragOver={(e) => e.preventDefault()}>
            Remove from group
          </div>
          <div
            className="flex-1 border-2 border-dashed border-warning/50 bg-warning/10 rounded-lg text-sm font-medium text-warning text-center px-4 py-4 transition-colors hover:bg-warning/20 hover:border-warning cursor-copy"
            onDrop={(e) => handleZoneDrop(e, (id) => dispatch(moveAuthorToOther(id)))}
            onDragOver={(e) => e.preventDefault()}>
            Move to Other
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorManagementView;
