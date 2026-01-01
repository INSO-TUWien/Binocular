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
import { TooltipIssue, TooltipMergeRequestGroup, TooltipSprintArea } from './components/Tooltip';
import { SprintAreas } from './components/SprintAreas';
import type { SprintType } from '../../../../../types/data/sprintType';
import type { MappedDataPluginIssue, MappedDataPluginMergeRequest, MappedSprint } from './types';

export const margin = 20;

type TooltipState = {
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

  const [tooltipState, setTooltipState] = React.useState<TooltipState>();

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

      setTooltipState(undefined);
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
        onClick={() => setTooltipState(undefined)}>
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

                    if (!(e.currentTarget instanceof SVGGElement)) {
                      return;
                    }

                    setTooltipState({ variant: 'issue', iid: issue.iid, anchor: e.currentTarget });
                  }}
                />
              )),
            )}

            <SprintChartLegend
              height={height}
              width={width}
              xScale={xScale}
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

            {showSprints && (
              <SprintAreas
                sprints={mappedSprints}
                xScale={xScale}
                height={height}
                onClick={({ currentTarget }, sprint) =>
                  setTooltipState({
                    variant: 'sprint-area',
                    anchor: currentTarget,
                    ...sprint,
                  })
                }
              />
            )}
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
          mergeRequests={groupedMergeRequests.find((group) => group.some((mr) => mr.iid === tooltipState.iid)) ?? []}
          onClickClose={() => setTooltipState(undefined)}
          onChangeMergeRequest={({ target: { value } }) =>
            setTooltipState((prev) => (prev ? { ...prev, iid: Number.parseInt(value, 10) } : prev))
          }
        />
      ) : tooltipState?.variant === 'sprint-area' ? (
        <TooltipSprintArea
          {...tooltipState}
          startDate={tooltipState.startDate}
          endDate={tooltipState.endDate}
          issues={mappedIssues.filter((i) => {
            const { startDate, endDate } = tooltipState;

            return (
              (i.createdAt.isBefore(startDate) && i.closedAt.isAfter(endDate)) ||
              i.createdAt.isBetween(tooltipState.startDate, tooltipState.endDate) ||
              i.closedAt.isBetween(tooltipState.startDate, tooltipState.endDate)
            );
          })}
          onClickClose={() => setTooltipState(undefined)}
        />
      ) : null}
    </div>
  );
};
