import chroma from 'chroma-js';
import { groupBy } from 'lodash';
import * as React from 'react';
import type { AuthorType } from '../../../../../../../types/data/authorType';
import { extractTimeTrackingDataFromNotes } from '../../../../../utils/extractTimeTrackingDataFromNotes';
import { aggregateTimeTrackingData } from '../helper/aggregateTimeTrackingData';
import type { MappedDataPluginIssue, MappedDataPluginMergeRequest } from '../types';
import { BaseDetailDialogLayout } from '../../../../../../../components/baseDetailDialog/BaseDetailDialogLayout';
import type { MappedSprint } from '../../../../../../../components/sprintAreas/SprintAreas';

/**
 * @param time Floating point number for the hours.
 * @returns The `time` formatted as `'XXh YYmin'`.
 */
const formatHours = (time: number) => {
  const abs = Math.abs(time);
  const h = Math.floor(abs);
  const m = Math.round((abs % 1) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

// TODO refactor when Dialog is extendable
export const DetailDialogIssue: React.FC<{
  iid: number;
  anchor: SVGElement;
  issues: MappedDataPluginIssue[];
  personColorMap: Map<string, AuthorType['color']>;

  onClickClose: React.MouseEventHandler;
}> = ({ issues, anchor, personColorMap, iid, onClickClose }) => {
  const i = issues.find((i) => i.iid === iid);

  const noteTrackingData = extractTimeTrackingDataFromNotes(i?.notes ?? []);
  const keyToName = new Map(noteTrackingData.map((d) => [d.author.user?.gitSignature ?? d.author.name, d.author.name]));
  const { aggregatedTimeTrackingData } = aggregateTimeTrackingData(noteTrackingData);

  return (
    <BaseDetailDialogLayout invisible={!i} anchor={anchor} onClickClose={onClickClose}>
      <h2 className={'card-title'} style={{ display: 'inline', wordBreak: 'break-word' }}>
        <a href={i?.webUrl} target={'_blank'} rel="noreferrer">
          <span>#{i?.iid} </span>
          <strong>{i?.title}</strong>
        </a>
      </h2>

      <p>
        <em>Created:</em> {i?.createdAt.format('lll')}
      </p>
      <p>
        <em>Closed:</em> {i?.state.toLowerCase() === 'closed' ? i?.closedAt?.format('lll') : 'open'}
      </p>
      <p>
        <em>Creator:</em> {i?.author?.name}
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

          <h6>Time Tracking ({aggregatedTimeTrackingData.size}):</h6>
          <ul className={'flex flex-col gap-1'}>
            {Array.from(aggregatedTimeTrackingData.entries()).map(([key, value]) => (
              <li
                key={key}
                className={'px-2 py-1 rounded text-sm'}
                style={{ borderLeft: `5px solid ${personColorMap.get(key)?.main ?? 'lightgrey'}` }}>
                {keyToName.get(key) ?? key}: {formatHours(value)}
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
        <em>Additions:</em> {i?.commits.reduce((acc, { stats }) => acc + stats.additions, 0)}
      </p>
      <p>
        <em>Deletions:</em> {i?.commits.reduce((acc, { stats }) => acc + stats.deletions, 0)}
      </p>

      <div className={'divider'} />

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {i?.labels.map((l) => (
          <span
            key={l.name}
            className={'badge badge-soft'}
            style={{
              backgroundColor: l.color,
              color: chroma.contrast(l.color, 'black') > 4.5 ? 'black' : 'white',
            }}>
            {l.name}
          </span>
        ))}
      </div>
    </BaseDetailDialogLayout>
  );
};

export const DetailDialogMergeRequestGroup: React.FC<{
  iid: number;
  anchor: SVGElement;
  mergeRequests: MappedDataPluginMergeRequest[];

  onClickClose: React.MouseEventHandler;
  onChangeMergeRequest: React.ChangeEventHandler<HTMLSelectElement>;
}> = ({ mergeRequests, anchor, iid, onClickClose, onChangeMergeRequest }) => {
  const mr = mergeRequests.find((mr) => mr.iid === iid);

  return (
    <BaseDetailDialogLayout invisible={!mr} anchor={anchor} onClickClose={onClickClose}>
      {mergeRequests.length > 1 && (
        <fieldset className={'fieldset'} style={{ width: '100%' }}>
          <legend className={'fieldset-legend'}>Merge Requests</legend>
          <select value={iid} className={'select select-xs'} style={{ width: '100%' }} onChange={onChangeMergeRequest}>
            {mergeRequests.map((mr) => (
              <option key={mr.iid} value={mr.iid}>
                {mr.title}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      <h2 className={'card-title'} style={{ display: 'inline', wordBreak: 'break-word' }}>
        <a href={mr?.webUrl} target={'_blank'} rel="noreferrer">
          <span>#{mr?.iid} </span>
          <strong>{mr?.title}</strong>
        </a>
      </h2>

      <p>
        <em>Created:</em> {mr?.createdAt.format('lll')}
      </p>
      <p>
        <em>Closed:</em> {mr?.state.toLowerCase() === 'closed' ? mr?.closedAt.format('lll') : 'open'}
      </p>
      <p>
        <em>Creator:</em> {mr?.author?.name}
      </p>
    </BaseDetailDialogLayout>
  );
};

export const DetailDialogSprintArea: React.FC<
  MappedSprint & {
    issues: MappedDataPluginIssue[];

    anchor: SVGElement;

    onClickClose: React.MouseEventHandler;
  }
> = ({ anchor, startDate, endDate, issues, onClickClose }) => {
  const groupedByAssignee = groupBy(issues, (i) => i.assignee?.name ?? 'No Assignee');

  const groupedByStatus = groupBy(issues, (i) => i.state);

  return (
    <BaseDetailDialogLayout invisible={false} anchor={anchor} onClickClose={onClickClose}>
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
                <a key={i.iid} href={i.webUrl} className={'link'} target={'_blank'} style={{ wordBreak: 'keep-all' }} rel="noreferrer">
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
              <em>{key}</em>

              {value.map((i) => (
                <a key={i.iid} href={i.webUrl} className={'link'} target={'_blank'} style={{ wordBreak: 'keep-all' }} rel="noreferrer">
                  {i.iid}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </BaseDetailDialogLayout>
  );
};
