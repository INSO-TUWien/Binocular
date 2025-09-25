import * as React from 'react';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import * as d3 from 'd3';
import classes from './sprintChart.module.css';
import type { AuthorType } from '../../../../../types/data/authorType';
import type { SprintSettings } from '../settings/settings';
import moment, { type Moment } from 'moment';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests';
import { SprintChartIssue } from './components/SprintChartIssue';
import { groupIntoTracks } from './helper/groupIntoTracks';
import { groupMergeRequests } from './helper/groupMergeRequests';
import { SprintChartLegend } from './components/SprintChartLegend';
import type {
  MappedDataPluginIssue,
  MappedDataPluginMergeRequest,
} from './types';
import { aggregateTimeTrackingData } from './helper/aggregateTimeTrackingData';
import { extractTimeTrackingDataFromNotes } from '../../../timeSpent/src/utilities/dataConverter';

const findMinMaxDate = (dates: Moment[]) =>
  dates.reduce(
    (acc, cur) => {
      if (cur.isAfter(acc.max.valueOf())) {
        acc.max = cur;
      }
      if (cur.isBefore(acc.min.valueOf())) {
        acc.min = cur;
      }
      return acc;
    },
    { min: moment(), max: moment() },
  );

export const margin = 20;

export const SprintChart: React.FC<
  {
    authors: AuthorType[];
    issues: DataPluginIssue[];
    mergeRequests: DataPluginMergeRequest[];
  } & Pick<SprintSettings, 'coloringMode'>
> = ({ authors, coloringMode, issues, mergeRequests }) => {
  const [{ width = 0, height = 0 } = {}, setDomRect] =
    React.useState<Partial<DOMRect>>();
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState(0);

  const [tooltipState, setTooltipState] = React.useState<{
    variant: 'merge-request' | 'issue';
    iid: number;
    anchor: SVGElement;
  }>();

  const svgChartRef = React.useRef<SVGSVGElement>(null);

  const mappedIssues = issues.map((i) => ({
    ...i,

    iid: Number.parseInt(i.iid as unknown as string, 10),

    createdAt: moment(i.createdAt),
    closedAt: i.closedAt ? moment(i.closedAt) : moment(),
  }));
  const mappedMergeRequests = mergeRequests.map((mr) => ({
    ...mr,

    iid: Number.parseInt(mr.iid as unknown as string, 10),

    createdAt: moment(mr.createdAt),
    closedAt: mr.closedAt ? moment(mr.closedAt) : moment(),
  }));
  console.log(mappedIssues);

  React.useEffect(() => {
    const { current: svg } = svgChartRef;
    if (!svg) {
      return;
    }

    setDomRect(svg.getBoundingClientRect() ?? {});

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setZoom(e.transform.k);
        setOffset(e.transform.y);

        setTooltipState(undefined);
      });
    d3.select(svg).call(zoom);
  }, []);

  const { min: minDate, max: maxDate } = findMinMaxDate(
    mappedIssues.flatMap((d) => [d.createdAt, d.closedAt]).filter((d) => !!d),
  );

  const groupedIssues = groupIntoTracks(mappedIssues);

  const scale = d3
    .scaleUtc()
    .range([20, Math.abs(width - margin)])
    .domain([minDate, maxDate]);

  const personColorMap = new Map(
    authors.map((a) => [a.user.gitSignature, a.color] as const),
  );

  const groupedMergeRequests =
    maxDate.diff(minDate, 'years') >= 1
      ? groupMergeRequests(mappedMergeRequests)
      : mappedMergeRequests.map((mr) => [mr]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        ref={svgChartRef}
        width={'100%'}
        height={'100%'}
        viewBox={`0, 0, ${width}, ${height}`}
        className={classes.container}
        onClick={() => setTooltipState(undefined)}
      >
        {height > 0 && width > 0 && (
          <>
            {groupedIssues.map((group, i) =>
              group.map((d) => (
                <SprintChartIssue
                  key={d.iid}
                  {...d}
                  trackNmbr={i}
                  availableTracks={groupedIssues.length}
                  height={height}
                  zoom={zoom}
                  width={width}
                  offset={offset}
                  scale={scale}
                  personColorMap={personColorMap}
                  coloringMode={coloringMode}
                  onClick={({ currentTarget }, iid) => {
                    const anchor = currentTarget.closest('g');

                    if (!anchor) {
                      return;
                    }

                    setTooltipState({ variant: 'issue', iid, anchor });
                  }}
                />
              )),
            )}

            <SprintChartLegend
              height={height}
              width={width}
              scale={scale}
              maxDate={maxDate}
              minDate={minDate}
              groupedMergeRequests={groupedMergeRequests}
              personColorMap={personColorMap}
              coloringMode={coloringMode}
              onClickMergeRequest={({ currentTarget }, iid) =>
                setTooltipState({
                  variant: 'merge-request',
                  iid,
                  anchor: currentTarget,
                })
              }
            />
          </>
        )}
      </svg>

      {tooltipState?.variant === 'issue' ? (
        <TooltipIssue
          {...tooltipState}
          issues={mappedIssues}
          personColorMap={personColorMap}
          onClickClose={() => setTooltipState(undefined)}
        />
      ) : tooltipState?.variant === 'merge-request' ? (
        <TooltipMergeRequestGroup
          {...tooltipState}
          mergeRequests={
            groupedMergeRequests.find((group) =>
              group.some((mr) => mr.iid === tooltipState.iid),
            ) ?? []
          }
          onClickClose={() => setTooltipState(undefined)}
          onChangeMergeRequest={({ target: { value } }) =>
            setTooltipState((prev) =>
              prev ? { ...prev, iid: Number.parseInt(value, 10) } : prev,
            )
          }
        />
      ) : null}
    </div>
  );
};

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

const TooltipIssue: React.FC<{
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

const TooltipMergeRequestGroup: React.FC<{
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
