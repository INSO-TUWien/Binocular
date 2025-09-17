import * as React from 'react';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import * as d3 from 'd3';
import classes from './sprintChart.module.css';
import type { AuthorType } from '../../../../../types/data/authorType';
import type { SprintSettings } from '../settings/settings';
import {
  extractTimeTrackingDataFromNotes,
  type TimeTrackingData,
} from '../../../timeSpent/src/utilities/dataConverter';
import moment, { type Moment } from 'moment';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests';

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

const findAuthorWithMaxSpentTime = (d: Map<string, number>) => {
  const entries = d.entries();
  let max = entries.next().value;
  if (!max) {
    return '';
  }

  for (const e of entries) {
    if (max[1] > e[1]) {
      continue;
    }

    max = e;
  }

  return max[0];
};

const aggregateTimeTrackingData = (timeTrackingData: TimeTrackingData[]) => {
  const aggregatedTimeTrackingData = new Map<string, number>();
  let totalTime = 0;

  for (const {
    author: { name },
    timeSpent,
  } of timeTrackingData) {
    aggregatedTimeTrackingData.set(
      name,
      (aggregatedTimeTrackingData.get(name) ?? 0) + timeSpent,
    );

    totalTime += timeSpent;
  }

  return { aggregatedTimeTrackingData, totalTime };
};

type MappedDataPluginIssue = Omit<DataPluginIssue, 'createdAt' | 'closedAt'> &
  Record<'createdAt' | 'closedAt', Moment>;

type MappedDataPluginMergeRequest = Omit<
  DataPluginMergeRequest,
  'createdAt' | 'closedAt'
> &
  Record<'createdAt' | 'closedAt', Moment>;

const groupIntoTracks = ([head, ...tail]: MappedDataPluginIssue[]) => {
  if (!head) {
    return [];
  }

  // Initialize tracks with the first issue in the list.
  // Simplifies the for-of loop
  const tracks: MappedDataPluginIssue[][] = [[head]];
  for (const issue of tail) {
    // Search for a track, that can hold the current issue.
    const openTrack = tracks.find((track) =>
      // A track is considered open, if none of the issues it holds overlaps with the new issue.
      track.every(
        (ti) =>
          !issue.createdAt.isBetween(ti.createdAt, ti.closedAt) &&
          !issue.closedAt.isBetween(ti.createdAt, ti.closedAt),
      ),
    );

    // If a track was found, append the issue.
    if (openTrack) {
      openTrack.push(issue);
      continue;
    }

    // Otherwise open a new track.
    tracks.push([issue]);
  }

  return tracks;
};

/**
 * Groups together merge requests within the same month.
 * @param mergeRequests 
 * @returns An array of merge request groups.
 */
const groupMergeRequests = (mergeRequests: MappedDataPluginMergeRequest[]) => {
  const map = new Map<String, MappedDataPluginMergeRequest[]>();
  for (const mr of mergeRequests) {
    const key = mr.createdAt.format('YYYY-MM');
    if (!map.has(mr.createdAt.format(key))) {
      map.set(key, [mr]);
      continue;
    }

    map.get(key)?.push(mr);
  }

  return [...map.values()];
};

const margin = 20;

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

  const svgChartRef = React.useRef<SVGSVGElement>(null);

  const mappedIssues = issues.map((i) => ({
    ...i,

    createdAt: moment(i.createdAt),
    closedAt: i.closedAt ? moment(i.closedAt) : moment(),
  }));
  const mappedMergeRequests = mergeRequests.map((mr) => ({
    ...mr,

    createdAt: moment(mr.createdAt),
    closedAt: mr.closedAt ? moment(mr.closedAt) : moment(),
  }));

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

  const authorColorMap = new Map(
    authors.map((a) => [a.user.gitSignature, a.color] as const),
  );

  const groupedMergeRequests =
    maxDate.diff(minDate, 'years') >= 1
      ? groupMergeRequests(mappedMergeRequests)
      : mappedMergeRequests.map((mr) => [mr]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      ref={svgChartRef}
      width={'100%'}
      height={'100%'}
      viewBox={`0, 0, ${width}, ${height}`}
      className={classes.container}
    >
      {height > 0 && width > 0 && (
        <>
          {groupedIssues.map((group, i) =>
            group.map((d) => {
              const h = Math.max(
                0,
                ((height - 110) / groupedIssues.length - 2) * zoom,
              );

              const x = scale(d.createdAt);
              const y =
                (30 + (i * height - 110) / groupedIssues.length - 2) * zoom +
                offset;

              const { aggregatedTimeTrackingData } = aggregateTimeTrackingData(
                extractTimeTrackingDataFromNotes(d.notes),
              );

              const color =
                authorColorMap.get(
                  (coloringMode === 'author'
                    ? d.author.user?.gitSignature
                    : coloringMode === 'assignee'
                      ? d.assignee?.user?.gitSignature
                      : coloringMode === 'time-spent'
                        ? findAuthorWithMaxSpentTime(aggregatedTimeTrackingData)
                        : undefined) ?? '',
                )?.main ?? 'lightgray';

              return (
                <g key={d.iid}>
                  <rect
                    width={Math.max(
                      scale(d.closedAt) - scale(d.createdAt) - 4,
                      h / groupedIssues.length - 2,
                      4,
                    )}
                    height={h}
                    x={x}
                    y={y}
                    fill={color}
                    strokeWidth={2}
                    rx={'0.2rem'}
                    stroke={color}
                  />
                  <text
                    x={x + 4}
                    y={y + margin}
                    width={Math.max(
                      scale(d.closedAt) - scale(d.createdAt) - 4,
                      1,
                    )}
                    height={h}
                    style={{ display: h > 25 ? undefined : 'none' }}
                  >
                    #{d.iid}
                  </text>
                </g>
              );
            }),
          )}

          <rect
            x={margin}
            y={height - margin * 2}
            width={width - margin * 2}
            height={80}
            fill={'#EEE'}
          />

          {scale.ticks().map((t) => {
            const x = scale(t);

            return (
              <text
                key={t.toISOString()}
                x={x}
                y={height - margin}
                fontSize={10}
              >
                {moment(t).format(
                  maxDate.diff(minDate, 'years') > 1 ? 'YYYY' : 'MM.YYYY',
                )}
              </text>
            );
          })}

          {groupedMergeRequests.map(([head, ...tail]) => {
            const x = scale(head.createdAt);

            const color =
              authorColorMap.get(
                (coloringMode === 'author'
                  ? head.author.user?.gitSignature
                  : coloringMode === 'assignee'
                    ? head.assignee?.user?.gitSignature
                    : undefined) ?? '',
              )?.main ?? 'lightgray';

            return (
              <circle
                key={head.id}
                cx={x}
                cy={height - margin + 10}
                r={6}
                fill={tail.length === 0 ? color : 'lightgray'}
                stroke={'darkgray'}
              />
            );
          })}
        </>
      )}
    </svg>
  );
};
