import * as React from 'react';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import * as d3 from 'd3';
import type { BurndownSettings } from '../settings/settings';
import moment, { type Moment, type unitOfTime } from 'moment';
import type { SprintType } from '../../../../../types/data/sprintType';
import { SprintAreas } from '../../../sprints/src/chart/components/SprintAreas';
import classes from './burndownChart.module.css';
import { TooltipLayout } from '../../../sprints/src/chart/components/Tooltip';

const legendBarHeight = 40;

const margin = 20;

interface MappedIssue extends Omit<DataPluginIssue, 'createdAt' | 'closedAt'> {
  createdAt: Moment;
  closedAt: Moment;
}

interface IssuesGroupedByGranularity {
  id: number;
  date: Moment;
  issues: MappedIssue[];
}

function* groupIssuesByGranularity(start: Moment, end: Moment, issues: MappedIssue[], granularity: unitOfTime.Base) {
  let date = start.clone();

  let id = 0;

  const cond = (date: Moment) => (i: MappedIssue) =>
    granularity === 'years' ? date.isSame(i.createdAt, 'year') : date.isBetween(i.createdAt, i.closedAt, undefined, '[]');

  do {
    yield {
      id,
      date,
      issues: issues.filter(cond(date)),
    } as IssuesGroupedByGranularity;

    const dateForLastYield = date.clone();

    date = date.clone().add(1, granularity).startOf(granularity);
    id += 1;

    if (date.isAfter(end)) {
      // append one last entry.
      // fixes the graph being cut off before the end is reached.
      yield {
        id: id + 1,
        date: end,
        issues: issues.filter(cond(dateForLastYield)),
      } as IssuesGroupedByGranularity;

      break;
    }
  } while (true);
}

function* pairUpDataPoints(data: IssuesGroupedByGranularity[], _maxDate: Moment) {
  for (let i = 1; i < data.length; i++) {
    yield [data[i - 1], data[i]] as const;
  }
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

      createdAt: moment(i.createdAt).startOf('day'),
      closedAt: closedAt.isAfter(maxDate) ? maxDate.clone().startOf('day') : closedAt.startOf('day'),
    };
  });

  const issuesPerGranularity = [...groupIssuesByGranularity(minDate, maxDate, mappedIssues, granularity)];
  const minNumberOfIssuesPerGranularity = issuesPerGranularity.reduce(
    (min, { issues }) => (min > issues.length ? issues.length : min),
    Number.MAX_SAFE_INTEGER,
  );
  const maxNumberOfIssuesPerGranularity = issuesPerGranularity.reduce(
    (max, { issues }) => (max < issues.length ? issues.length : max),
    Number.MIN_SAFE_INTEGER,
  );

  const mappedSprints = sprints.map((s) => ({
    ...s,

    startDate: moment(s.startDate).startOf('day'),
    endDate: moment(s.endDate).startOf('day'),
  }));

  const pairedUpDataPoints = [...pairUpDataPoints(issuesPerGranularity, maxDate)];

  const xScale = d3
    .scaleUtc()
    .range([margin * 2, width - margin])
    .domain([minDate, maxDate]);
  const yScale = d3
    .scaleLinear()
    .range([height - 40, 0])
    .domain([minNumberOfIssuesPerGranularity - 2, maxNumberOfIssuesPerGranularity + 5]);

  const [tooltipState, setTooltipState] = React.useState<{
    anchor: SVGElement;
    id: number;
  }>();

  return (
    <div style={{ height, width, position: 'relative' }}>
      <svg xmlns="http://www.w3.org/2000/svg" ref={svgChartRef} width={'100%'} height={'100%'} viewBox={`0, 0, ${width}, ${height}`}>
        {height > 0 && width > 0 && (
          <>
            {pairedUpDataPoints.map(([{ id: aId, date: aDate, issues: aIssues }, { id: bId, date: bDate, issues: bIssues }], i) => (
              <g key={`${aId}_${bId}`} className={classes['data-point']}>
                <line
                  x1={xScale(aDate)}
                  y1={yScale(aIssues.length)}
                  x2={xScale(bDate)}
                  y2={yScale(bIssues.length)}
                  stroke={'lightblue'}
                  fill={'lightblue'}
                  shapeRendering={'geometricPrecision'}
                  strokeWidth={2}
                />

                {i === 0 && (
                  <circle
                    r={4}
                    cx={xScale(aDate)}
                    cy={yScale(aIssues.length)}
                    fill={'lightblue'}
                    stroke={'lightblue'}
                    onClick={({ currentTarget }) => setTooltipState({ anchor: currentTarget, id: aId })}
                    className={[classes['data-point'], aId === tooltipState?.id ? classes.active : ''].join(' ')}
                  />
                )}

                <circle
                  r={4}
                  cx={xScale(bDate)}
                  cy={yScale(bIssues.length)}
                  fill={'lightblue'}
                  stroke={'lightblue'}
                  onClick={({ currentTarget }) => setTooltipState({ anchor: currentTarget, id: bId })}
                  className={[classes['data-point'], bId === tooltipState?.id ? classes.active : ''].join(' ')}
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

            {showSprints && <SprintAreas sprints={mappedSprints} xScale={xScale} height={height} />}
          </>
        )}
      </svg>

      {tooltipState?.anchor && (
        <BurndownTooltip
          {...tooltipState}
          onClickClose={() => setTooltipState(undefined)}
          issuesPerGranularity={issuesPerGranularity}
          minDate={minDate}
          maxDate={maxDate}
          granularity={granularity}
          nmbrOfIssues={issues.length}
          maxNumberOfIssuesPerGranularity={maxNumberOfIssuesPerGranularity}
        />
      )}
    </div>
  );
};

const BurndownTooltip: React.FC<{
  anchor: SVGElement;
  id: number;
  issuesPerGranularity: IssuesGroupedByGranularity[];
  onClickClose: React.MouseEventHandler;
  minDate: Moment;
  maxDate: Moment;
  granularity: unitOfTime.Base;
  maxNumberOfIssuesPerGranularity: number;
  nmbrOfIssues: number;
}> = ({ anchor, id, issuesPerGranularity, maxNumberOfIssuesPerGranularity, minDate, maxDate, granularity, onClickClose }) => {
  const value = issuesPerGranularity.find((ipg) => ipg.id === id);
  const previousValue = issuesPerGranularity.find((ipg) => ipg.id === id - 1);
  const differenceWithPreviousValue = value && previousValue ? value.issues.length - previousValue.issues.length : 0;

  const localGranularity = ['years', 'year'].includes(granularity) ? 'months' : granularity;

  const idealStepSize = maxNumberOfIssuesPerGranularity / maxDate.diff(minDate, localGranularity);
  const differenceWithIdeal = Math.round(
    value ? value.issues.length - (maxDate.diff(value.date, localGranularity) ?? 0) * idealStepSize : 0,
  );

  return (
    <TooltipLayout anchor={anchor} onClickClose={onClickClose} invisible={!value}>
      <h2 className={'card-title'} style={{ display: 'inline', wordBreak: 'break-word' }}>
        {value?.date.format('ll')}
      </h2>
      <p>
        <em>Open issues:</em> <span>{value?.issues.length}</span>
      </p>
      <p>
        <em>Difference with previous:</em>{' '}
        <span className={classes['tooltip-difference']} data-sign={Math.sign(differenceWithPreviousValue)}>
          {Number.isNaN(differenceWithPreviousValue) ? 0 : differenceWithPreviousValue}
        </span>
      </p>
      <p>
        <em>Difference with ideal:</em>{' '}
        <span className={classes['tooltip-difference']} data-sign={Math.sign(differenceWithIdeal)}>
          {Number.isNaN(differenceWithIdeal) ? 0 : differenceWithIdeal}
        </span>
      </p>
    </TooltipLayout>
  );
};
