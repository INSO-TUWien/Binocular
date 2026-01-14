import * as React from 'react';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import * as d3 from 'd3';
import type { BurndownSettings } from '../settings/settings';
import moment, { type Moment, type unitOfTime } from 'moment';
import type { SprintType } from '../../../../../types/data/sprintType';
import { SprintAreas } from '../../../sprints/src/chart/components/SprintAreas';
import { BurndownChartYAxisLegend } from './components/BurndownChartYAxisLegend';
import { BurndownChartXAxisLegend } from './components/BurndownChartXAxisLegend';
import { BurndownChartDetailDialog } from './components/BurndownChartDetailDialog';
import { groupIssuesByGranularity } from './helper/groupIssuesByGranularity';
import { pairUpDataPoints } from './helper/pairUpDataPoints';
import { BurndownChartDataPoint } from './components/BurndownChartDataPoint';
import type { MappedIssue } from './types';

export const legendBarHeight = 40;

export const margin = 20;

const mapIssue = (i: DataPluginIssue): MappedIssue => {
  const closedAt = i.closedAt ? moment(i.closedAt).startOf('day') : undefined;

  return {
    ...i,

    createdAt: moment(i.createdAt).startOf('day'),
    closedAt,
  };
};

export const BurndownChart: React.FC<
  {
    issues: DataPluginIssue[];
    sprints: SprintType[];
    fromDate: Moment;
    toDate: Moment;
    width: number;
    height: number;
    granularity: unitOfTime.Base;
  } & Pick<BurndownSettings, 'showSprints'>
> = ({ issues, fromDate, toDate, showSprints, height, width, sprints, granularity }) => {
  const mappedIssues = issues.map(mapIssue);

  const minDate = mappedIssues.reduce((acc, { createdAt }) => (createdAt.isBefore(acc) ? createdAt : acc), toDate);
  const maxDate = mappedIssues.reduce((acc, { closedAt }) => (closedAt?.isAfter(acc) ? closedAt : acc), fromDate);

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

  const pairedUpDataPoints = [...pairUpDataPoints(issuesPerGranularity)];

  const xScale = d3
    .scaleUtc()
    .range([margin * 2, width - margin])
    .domain([minDate, maxDate]);
  const yScale = d3
    .scaleLinear()
    .range([height - margin * 2, 0])
    .domain([minNumberOfIssuesPerGranularity - 2, maxNumberOfIssuesPerGranularity + 5]);

  const [tooltipState, setTooltipState] = React.useState<{
    anchor: SVGElement;
    id: number;
  }>();

  return (
    <div style={{ height, width, position: 'relative' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={'100%'} height={'100%'} viewBox={`0, 0, ${width}, ${height}`}>
        {height > 0 && width > 0 && (
          <>
            {pairedUpDataPoints.map(([{ id: aId, date: aDate, issues: aIssues }, { id: bId, date: bDate, issues: bIssues }], i) => (
              <g key={`${aId}_${bId}`}>
                {i === 0 && (
                  <BurndownChartDataPoint
                    cx={xScale(aDate)}
                    cy={yScale(aIssues.length)}
                    onClick={({ currentTarget }) => setTooltipState({ anchor: currentTarget, id: aId })}
                    active={aId === tooltipState?.id}
                  />
                )}

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

                <BurndownChartDataPoint
                  cx={xScale(bDate)}
                  cy={yScale(bIssues.length)}
                  onClick={({ currentTarget }) => setTooltipState({ anchor: currentTarget, id: bId })}
                  active={bId === tooltipState?.id}
                />
              </g>
            ))}

            <line
              x1={xScale(fromDate)}
              y1={yScale(maxNumberOfIssuesPerGranularity)}
              x2={xScale(toDate)}
              y2={yScale(minNumberOfIssuesPerGranularity)}
              stroke={'green'}
              fill={'green'}
            />

            <BurndownChartXAxisLegend height={height} width={width} xScale={xScale} />
            <BurndownChartYAxisLegend height={height} yScale={yScale} />

            {showSprints && <SprintAreas sprints={mappedSprints} xScale={xScale} height={height} />}
          </>
        )}
      </svg>

      {tooltipState?.anchor && (
        <BurndownChartDetailDialog
          {...tooltipState}
          onClickClose={() => setTooltipState(undefined)}
          issuesPerGranularity={issuesPerGranularity}
          minDate={fromDate}
          maxDate={toDate}
          granularity={granularity}
          nmbrOfIssues={issues.length}
          maxNumberOfIssuesPerGranularity={maxNumberOfIssuesPerGranularity}
        />
      )}
    </div>
  );
};
