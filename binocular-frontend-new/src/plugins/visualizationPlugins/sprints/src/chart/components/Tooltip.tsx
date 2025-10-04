import * as React from 'react';
import type { AuthorType } from '../../../../../../types/data/authorType';
import { extractTimeTrackingDataFromNotes } from '../../../../timeSpent/src/utilities/dataConverter';
import { aggregateTimeTrackingData } from '../helper/aggregateTimeTrackingData';
import { margin } from '../SprintChart';
import type {
  MappedDataPluginIssue,
  MappedDataPluginMergeRequest,
  MappedSprintType,
} from '../types';
import { groupBy } from 'lodash';

const TooltipLayout: React.FC<
  React.PropsWithChildren<{
    anchor: SVGElement;
    visible: boolean;

    onClickClose: React.MouseEventHandler;
  }>
> = ({ children, anchor, visible, onClickClose }) => {
  const svg = anchor.closest('svg');
  const svgRect = svg?.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  const tooltipWidth = 400;

  const top = anchorRect.top - (svgRect?.top ?? 0) + anchorRect.height + 4;
  const left = anchorRect.left - (svgRect?.left ?? 0);

  const halfwayDivider = (svgRect?.height ?? 0) / 2;

  return (
    <div
      className={'card bg-base-100 shadow-xl rounded border-2 p-2 break-all'}
      style={{
        position: 'absolute',
        top: top <= halfwayDivider ? top : undefined,
        bottom:
          top > halfwayDivider
            ? (svgRect?.bottom ?? 0) - anchorRect.bottom + anchorRect.height + 4
            : undefined,
        left:
          left + tooltipWidth > (svgRect?.right ?? 0)
            ? left - (left + tooltipWidth - (svgRect?.right ?? 0)) - margin * 2
            : left,
        width: tooltipWidth,
        display: visible ? 'none' : undefined,
        maxHeight: 600,
        overflow: 'auto',
      }}
    >
      {children}

      <div className={'card-actions justify-end'}>
        <button className={'btn btn-xs'} onClick={onClickClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export const TooltipIssue: React.FC<{
  iid: number;
  anchor: SVGElement;
  issues: MappedDataPluginIssue[];
  personColorMap: Map<string, AuthorType['color']>;

  onClickClose: React.MouseEventHandler;
}> = ({ issues, anchor, personColorMap, iid, onClickClose }) => {
  const i = issues.find((i) => i.iid === iid);

  const { aggregatedTimeTrackingData, totalTime } = aggregateTimeTrackingData(
    extractTimeTrackingDataFromNotes(i?.notes ?? []),
  );

  return (
    <TooltipLayout visible={!i} anchor={anchor} onClickClose={onClickClose}>
      <h2
        className={'card-title'}
        style={{ display: 'inline', wordBreak: 'break-word' }}
      >
        <a href={i?.webUrl} target={'_blank'}>
          <span>#{i?.iid} </span>
          <strong>{i?.title}</strong>
        </a>
      </h2>

      <p>
        <em>Created:</em> {i?.createdAt.format('lll')}
      </p>
      <p>
        <em>Closed:</em>{' '}
        {i?.state.toLowerCase() === 'closed'
          ? i?.closedAt.format('lll')
          : 'open'}
      </p>
      <p>
        <em>Creator:</em> {i?.author.name}
      </p>

      <div className="divider" />

      <h6>Assignees ({i?.assignees.length}):</h6>
      <ul>
        {i?.assignees.map((a) => (
          <li key={a.name}>{a.name}</li>
        ))}
      </ul>

      {aggregatedTimeTrackingData.size > 0 && (
        <>
          <div className={'divider'} />

          <h6>Time Tracking ({i?.assignees.length}):</h6>
          <ul>
            {[...aggregatedTimeTrackingData.entries()].map(([key, value]) => (
              <li
                key={key}
                style={{
                  width: `${(100 / totalTime) * value}%`,
                  backgroundColor: personColorMap.get(key)?.main ?? 'lightgrey',
                }}
              >
                {value}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={'divider'} />

      <p>
        <em>Linked Commits:</em> {i?.commits.length}
      </p>
      <p>
        <em>Additions:</em>{' '}
        {i?.commits.reduce((acc, { additions }) => acc + additions, 0)}
      </p>
      <p>
        <em>Deletions:</em>{' '}
        {i?.commits.reduce((acc, { deletions }) => acc + deletions, 0)}
      </p>
    </TooltipLayout>
  );
};

export const TooltipMergeRequestGroup: React.FC<{
  iid: number;
  anchor: SVGElement;
  mergeRequests: MappedDataPluginMergeRequest[];

  onClickClose: React.MouseEventHandler;
  onChangeMergeRequest: React.ChangeEventHandler<HTMLSelectElement>;
}> = ({ mergeRequests, anchor, iid, onClickClose, onChangeMergeRequest }) => {
  const mr = mergeRequests.find((i) => i.iid === iid);

  return (
    <TooltipLayout visible={!mr} anchor={anchor} onClickClose={onClickClose}>
      {mergeRequests.length > 1 && (
        <fieldset className={'fieldset'} style={{ width: '100%' }}>
          <legend className={'fieldset-legend'}>Merge Requests</legend>
          <select
            value={iid}
            className={'select select-xs'}
            style={{ width: '100%' }}
            onChange={onChangeMergeRequest}
          >
            {mergeRequests.map((mr) => (
              <option key={mr.iid} value={mr.iid}>
                {mr.title}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      <h2
        className={'card-title'}
        style={{ display: 'inline', wordBreak: 'break-word' }}
      >
        <a href={mr?.webUrl} target={'_blank'}>
          <span>#{mr?.iid} </span>
          <strong>{mr?.title}</strong>
        </a>
      </h2>

      <p>
        <em>Created:</em> {mr?.createdAt.format('lll')}
      </p>
      <p>
        <em>Closed:</em>{' '}
        {mr?.state.toLowerCase() === 'closed'
          ? mr?.closedAt.format('lll')
          : 'open'}
      </p>
      <p>
        <em>Creator:</em> {mr?.author.name}
      </p>
    </TooltipLayout>
  );
};

export const TooltipSprintArea: React.FC<
  MappedSprintType & {
    issues: MappedDataPluginIssue[];

    anchor: SVGElement;

    onClickClose: React.MouseEventHandler;
  }
> = ({ anchor, startDate, endDate, issues, onClickClose }) => {
  const groupedByAssignee = groupBy(
    issues,
    (i) => i.assignee?.name ?? 'No Assignee',
  );

  const groupedByStatus = groupBy(issues, (i) => i.state);

  return (
    <TooltipLayout visible={false} anchor={anchor} onClickClose={onClickClose}>
      <h2 className={'card-title'}>
        {startDate.format('L')} - {endDate.format('L')}
      </h2>

      <div className={'divider'} />

      <h6>Issues by Assignees:</h6>
      <ul>
        {Object.entries(groupedByAssignee).map(([key, value]) => (
          <li key={key}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <em>{key}</em>

              {value.map((i) => (
                <a
                  key={i.iid}
                  href={i.webUrl}
                  className={'link'}
                  target={'_blank'}
                  style={{ wordBreak: 'keep-all' }}
                >
                  {i.iid}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className={'divider'} />

      <h6>Issues by State:</h6>
      <ul>
        {Object.entries(groupedByStatus).map(([key, value]) => (
          <li key={key}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <i>{key}</i>

              {value.map((i) => (
                <a
                  key={i.iid}
                  href={i.webUrl}
                  className={'link'}
                  target={'_blank'}
                  style={{ wordBreak: 'keep-all' }}
                >
                  {i.iid}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </TooltipLayout>
  );
};
