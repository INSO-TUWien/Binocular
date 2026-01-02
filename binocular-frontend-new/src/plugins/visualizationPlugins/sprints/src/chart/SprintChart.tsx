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
import { DetailDialogIssue, DetailDialogMergeRequestGroup, DetailDialogSprintArea } from './components/DetailDialog';
import { SprintAreas } from './components/SprintAreas';
import type { SprintType } from '../../../../../types/data/sprintType';
import type { MappedDataPluginIssue, MappedDataPluginMergeRequest, MappedSprint } from './types';
import { SprintChartMergeRequest } from './components/SprintChartMergeRequest';

export const margin = 20;

type DetailDialogState = {
  anchor: SVGElement;
} & ({ variant: 'merge-request' | 'issue'; iid: number } | ({ variant: 'sprint-area' } & MappedSprint));

const stringToColor = (string: string) => {
  let stringWithInvalidCharsReplaced = string
    .split('')
    .map((c) => (/[0-9A-F]/gi.test(c) ? c : 0))
    .join('');

  while (stringWithInvalidCharsReplaced.length % 3 !== 0) {
    stringWithInvalidCharsReplaced += '0';
  }

  const partLength = stringWithInvalidCharsReplaced.length / 3;
  const subStringLength = partLength === 1 ? 1 : 2;

  const red = stringWithInvalidCharsReplaced.substring(0, subStringLength);
  const green = stringWithInvalidCharsReplaced.substring(partLength, partLength + subStringLength);
  const blue = stringWithInvalidCharsReplaced.substring(partLength * 2, partLength * 2 + subStringLength);

  return `#${red}${green}${blue}`;
};

const mapIssue = (maxDate: Moment, groupedLabels: Map<number, string[]>, colorsForLabelGroups: Map<number, string>) => {
  const keyValueGroupedLabels = [...groupedLabels];

  return (i: DataPluginIssue): MappedDataPluginIssue => {
    const closedAt = i.closedAt ? moment(i.closedAt) : maxDate;

    return {
      ...i,

      createdAt: moment(i.createdAt),
      closedAt: closedAt.isAfter(maxDate) ? maxDate : closedAt,

      labels: i.labels.map((l) => {
        const [groupId] = keyValueGroupedLabels.find(([, values]) => values.includes(l)) ?? [];

        return {
          name: l,
          color: colorsForLabelGroups.get(groupId ?? Number.POSITIVE_INFINITY) ?? 'lightgrey',
        };
      }),
    };
  };
};

const mapMergeRequest =
  (maxDate: Moment) =>
  (mr: DataPluginMergeRequest): MappedDataPluginMergeRequest => ({
    ...mr,

    createdAt: moment(mr.createdAt),
    closedAt: mr.closedAt ? moment(mr.closedAt) : maxDate,
  });

const mapSprint = (s: SprintType): MappedSprint => ({
  ...s,

  startDate: moment(s.startDate),
  endDate: moment(s.endDate),
});

export const SprintChart: React.FC<
  {
    authors: AuthorType[];
    issues: DataPluginIssue[];
    mergeRequests: DataPluginMergeRequest[];
    sprints: SprintType[];
    minDate: Moment;
    maxDate: Moment;
    showSprints: boolean;
    width: number;
    height: number;
    groupedLabels: Map<number, string[]>;
  } & Pick<SprintSettings, 'coloringMode'>
> = ({ authors, coloringMode, issues, mergeRequests, sprints, minDate, maxDate, showSprints, height, width, groupedLabels }) => {
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState(0);

  const [detailDialogState, setDetailDialogState] = React.useState<DetailDialogState>();

  const svgChartRef = React.useRef<SVGSVGElement>(null);

  const colorsForLabelGroups = new Map([...groupedLabels].map(([key, values]) => [key, stringToColor(values.join(''))] as const));

  const mappedIssues = issues.map(mapIssue(maxDate, groupedLabels, colorsForLabelGroups));
  const mappedMergeRequests = mergeRequests.map(mapMergeRequest(maxDate));
  const mappedSprints = sprints.map(mapSprint);

  React.useEffect(() => {
    const { current: svg } = svgChartRef;
    if (!svg) {
      return;
    }

    const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      setZoom(e.transform.k);
      setOffset(e.transform.y);

      setDetailDialogState(undefined);
    });
    d3.select(svg).call(zoom);
  }, []);

  const groupedIssues = groupIntoTracks(mappedIssues);

  const xScale = d3
    .scaleUtc()
    .range([margin, Math.abs(width - margin)])
    .domain([minDate, maxDate]);

  const personColorMap = new Map(authors.map((a) => [a.user.gitSignature, a.color] as const));

  const groupedMergeRequests =
    maxDate.diff(minDate, 'years') >= 1 ? groupMergeRequests(mappedMergeRequests) : mappedMergeRequests.map((mr) => [mr]);

  return (
    <div style={{ height, width, position: 'relative' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        ref={svgChartRef}
        width={'100%'}
        height={'100%'}
        viewBox={`0, 0, ${width}, ${height}`}
        className={classes.container}
        onClick={() => setDetailDialogState(undefined)}>
        {height > 0 && width > 0 && (
          <>
            {groupedIssues.flatMap((group, trackNmbr) =>
              group.map((issue) => (
                <SprintChartIssue
                  key={issue.iid}
                  {...issue}
                  trackNmbr={trackNmbr}
                  availableTracks={groupedIssues.length}
                  height={height}
                  zoom={zoom}
                  width={width}
                  offset={offset}
                  xScale={xScale}
                  personColorMap={personColorMap}
                  coloringMode={coloringMode}
                  onClick={(e) => {
                    // Stop propagation, otherwise the tooltip isn't placed
                    e.stopPropagation();

                    setDetailDialogState({ variant: 'issue', iid: issue.iid, anchor: e.currentTarget });
                  }}
                />
              )),
            )}

            <SprintChartLegend height={height} width={width} xScale={xScale} maxDate={maxDate} minDate={minDate} />

            {groupedMergeRequests.map((group) => (
              <SprintChartMergeRequest
                key={group[0].iid}
                height={height}
                xScale={xScale}
                mergeRequestGroup={group}
                personColorMap={personColorMap}
                coloringMode={coloringMode}
                onClick={(e) => {
                  // Stop propagation, otherwise the tooltip isn't placed
                  e.stopPropagation();

                  setDetailDialogState({ variant: 'merge-request', iid: group[0].iid, anchor: e.currentTarget });
                }}
              />
            ))}

            {showSprints && (
              <SprintAreas
                sprints={mappedSprints}
                xScale={xScale}
                height={height}
                onClick={(sprint) => (e) => {
                  e.stopPropagation();

                  setDetailDialogState({ variant: 'sprint-area', anchor: e.currentTarget, ...sprint });
                }}
              />
            )}
          </>
        )}
      </svg>

      {detailDialogState?.variant === 'issue' ? (
        <DetailDialogIssue
          {...detailDialogState}
          issues={mappedIssues}
          personColorMap={personColorMap}
          onClickClose={() => setDetailDialogState(undefined)}
        />
      ) : detailDialogState?.variant === 'merge-request' ? (
        <DetailDialogMergeRequestGroup
          {...detailDialogState}
          mergeRequests={groupedMergeRequests.find((group) => group.some((mr) => mr.iid === detailDialogState.iid)) ?? []}
          onClickClose={() => setDetailDialogState(undefined)}
          onChangeMergeRequest={({ target: { value } }) =>
            setDetailDialogState((prev) => (prev ? { ...prev, iid: Number.parseInt(value, 10) } : prev))
          }
        />
      ) : detailDialogState?.variant === 'sprint-area' ? (
        <DetailDialogSprintArea
          {...detailDialogState}
          startDate={detailDialogState.startDate}
          endDate={detailDialogState.endDate}
          issues={mappedIssues.filter((i) => {
            const { startDate, endDate } = detailDialogState;

            return (
              (i.createdAt.isBefore(startDate) && i.closedAt.isAfter(endDate)) ||
              i.createdAt.isBetween(detailDialogState.startDate, detailDialogState.endDate) ||
              i.closedAt.isBetween(detailDialogState.startDate, detailDialogState.endDate)
            );
          })}
          onClickClose={() => setDetailDialogState(undefined)}
        />
      ) : null}
    </div>
  );
};
