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

  const personColorMap = new Map(
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
          />
        </>
      )}
    </svg>
  );
};

