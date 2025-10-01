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
import { TooltipIssue, TooltipMergeRequestGroup } from './components/Tooltip';
import { SprintAreas } from './components/SprintAreas';
import type { SprintType } from '../../../../../types/data/sprintType';

export const margin = 20;

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
  } & Pick<SprintSettings, 'coloringMode'>
> = ({
  authors,
  coloringMode,
  issues,
  mergeRequests,
  sprints,
  minDate,
  maxDate,
  showSprints,
  height,
  width,
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState(0);

  const [tooltipState, setTooltipState] = React.useState<{
    variant: 'merge-request' | 'issue';
    iid: number;
    anchor: SVGElement;
  }>();

  const svgChartRef = React.useRef<SVGSVGElement>(null);

  const mappedIssues = issues.map((i) => {
    const closedAt = i.closedAt ? moment(i.closedAt) : maxDate;

    return {
      ...i,

      iid: Number.parseInt(i.iid as unknown as string, 10),

      createdAt: moment(i.createdAt),
      closedAt: closedAt.isAfter(maxDate) ? maxDate : closedAt,
    };
  });
  const mappedMergeRequests = mergeRequests.map((mr) => ({
    ...mr,

    iid: Number.parseInt(mr.iid as unknown as string, 10),

    createdAt: moment(mr.createdAt),
    closedAt: mr.closedAt ? moment(mr.closedAt) : maxDate,
  }));

  React.useEffect(() => {
    const { current: svg } = svgChartRef;
    if (!svg) {
      return;
    }

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setZoom(e.transform.k);
        setOffset(e.transform.y);

        setTooltipState(undefined);
      });
    d3.select(svg).call(zoom);
  }, []);

  const groupedIssues = groupIntoTracks(mappedIssues);

  const scale = d3
    .scaleUtc()
    .range([margin, Math.abs(width - margin)])
    .domain([minDate, maxDate]);

  const personColorMap = new Map(
    authors.map((a) => [a.user.gitSignature, a.color] as const),
  );

  const groupedMergeRequests =
    maxDate.diff(minDate, 'years') >= 1
      ? groupMergeRequests(mappedMergeRequests)
      : mappedMergeRequests.map((mr) => [mr]);

  return (
    <div style={{ height, width, position: 'relative' }}>
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

            {showSprints && (
              <SprintAreas sprints={sprints} scale={scale} height={height} />
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
