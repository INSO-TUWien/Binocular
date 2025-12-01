import * as React from 'react';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import * as d3 from 'd3';
import type { BurndownSettings } from '../settings/settings';
import moment, { type Moment, type unitOfTime } from 'moment';
import type { SprintType } from '../../../../../types/data/sprintType';
import { SprintAreas } from '../../../sprints/src/chart/components/SprintAreas';
import classes from './burndownChart.module.css';

const legendBarHeight = 40;

const margin = 20;

interface MappedIssue extends Omit<DataPluginIssue, 'createdAt' | 'closedAt'> {
  createdAt: Moment;
  closedAt: Moment;
}

function* eachDayInInterval(start: Moment, end: Moment, issues: MappedIssue[], granularity: unitOfTime.Base) {
  let d = start.clone();

  do {
    yield [
      d,
      issues.filter((i) => (granularity === 'years' ? d.isSame(i.createdAt, 'year') : d.isBetween(i.createdAt, i.closedAt))).length,
    ] as const;

    d = d.clone().add(1, granularity).startOf(granularity);

    if (d.isAfter(end)) {
      break;
    }
  } while (true);
}

function* pairUpDataPoints(data: Readonly<[date: Moment, numberOfIssues: number]>[], maxDate: Moment) {
  for (let i = 1; i < data.length; i++) {
    yield [data[i - 1], data[i]] as const;
  }

  yield [data[data.length - 1], [maxDate, data[data.length - 1][1]]] as const;
}

export const BurndownChart: React.FC<
  {
    issues: DataPluginIssue[];
    sprints: SprintType[];
    minDate: Moment;
    maxDate: Moment;
    width: number;
    height: number;
    granularity: unitOfTime.Base;
  } & Pick<BurndownSettings, 'showSprints'>
> = ({ issues, minDate, maxDate, showSprints, height, width, sprints, granularity }) => {
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

  const numberOfIssuesPerDay = [...eachDayInInterval(minDate, maxDate, mappedIssues, granularity)];
  const minNumberOfIssuesPerGranularity = numberOfIssuesPerDay.reduce(
    (min, [, curr]) => (min > curr ? curr : min),
    Number.MAX_SAFE_INTEGER,
  );
  const maxNumberOfIssuesPerGranularity = numberOfIssuesPerDay.reduce(
    (max, [, curr]) => (max < curr ? curr : max),
    Number.MIN_SAFE_INTEGER,
  );

  const mappedSprints = sprints.map((s) => ({
    ...s,

    startDate: moment(s.startDate),
    endDate: moment(s.endDate),
  }));

  const xScale = d3
    .scaleUtc()
    .range([margin * 2, width - margin])
    .domain([minDate, maxDate]);
  const yScale = d3
    .scaleLinear()
    .range([height - 40, 0])
    .domain([minNumberOfIssuesPerGranularity, maxNumberOfIssuesPerGranularity + 5]);

  return (
    <div style={{ height, width, position: 'relative' }}>
      <svg xmlns="http://www.w3.org/2000/svg" ref={svgChartRef} width={'100%'} height={'100%'} viewBox={`0, 0, ${width}, ${height}`}>
        {height > 0 && width > 0 && (
          <>
            {[...pairUpDataPoints(numberOfIssuesPerDay, maxDate)].map(([[aDate, aNumberOfIssues], [bDate, bNumberOfIssues]]) => (
              <g key={bDate.format()} className={classes.section}>
                <rect x={xScale(aDate)} width={xScale(bDate) - xScale(aDate)} height={height} stroke={'transparent'} fill={'transparent'} />

                <line
                  x1={xScale(aDate)}
                  y1={yScale(aNumberOfIssues)}
                  x2={xScale(bDate)}
                  y2={yScale(bNumberOfIssues)}
                  stroke={'blue'}
                  fill={'blue'}
                />
              </g>
            ))}

            <line
              x1={xScale(minDate)}
              y1={yScale(maxNumberOfIssuesPerGranularity)}
              x2={xScale(maxDate)}
              y2={yScale(minNumberOfIssuesPerGranularity)}
              stroke={'green'}
              fill={'green'}
            />

            <rect x={margin * 2} y={height - legendBarHeight} height={1} width={width - margin * 3} />
            <rect x={margin * 2} y={height + 1 - legendBarHeight} width={width - margin * 3} height={40} fill={'#EEE'} />
            {xScale.ticks().map((t) => {
              const x = xScale(t);

              return (
                <g key={t.toISOString()}>
                  <rect x={x} y={height - legendBarHeight} width={1} height={8} fill={'#000'} />
                  <text x={x} y={height - legendBarHeight / 2} fontSize={10} textAnchor={'middle'}>
                    {moment(t).format(maxDate.diff(minDate, 'years') > 1 ? 'YYYY' : 'MM.YYYY')}
                  </text>
                </g>
              );
            })}

            <rect x={margin * 2} y={0} height={height - margin * 2} width={1} />
            <rect x={0} y={0} width={margin * 2} height={height} fill={'#EEE'} />
            {yScale.ticks().map((t) => {
              const y = yScale(t);

              return (
                <g key={t}>
                  <rect x={margin * 2 - 8} y={y} width={8} height={1} fill={'#000'} />
                  <text x={margin} y={y} fontSize={10} textAnchor={'middle'} alignmentBaseline={'central'}>
                    {t}
                  </text>
                </g>
              );
            })}

            {showSprints && <SprintAreas sprints={mappedSprints} scale={xScale} height={height} />}
          </>
        )}
      </svg>
    </div>
  );
};
