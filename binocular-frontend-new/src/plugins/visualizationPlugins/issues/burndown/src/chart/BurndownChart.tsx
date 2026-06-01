import * as React from 'react';
import type { DataPluginIssue } from '../../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import * as d3 from 'd3';
import type { BurndownSettings } from '../settings/settings';
import moment, { type Moment, type unitOfTime } from 'moment';
import type { SprintType } from '../../../../../../types/data/sprintType';
import { BurndownChartDetailDialog } from './components/BurndownChartDetailDialog';
import { groupIssuesByGranularity } from './helper/groupIssuesByGranularity';
import { pairUpDataPoints } from './helper/pairUpDataPoints';
import { BurndownChartDataPoint } from './components/BurndownChartDataPoint';
import type { MappedIssue } from './types';
import { SprintAreas } from '../../../../../../components/sprintAreas/SprintAreas';

export const legendBarHeight = 60;

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
  const maxNumberOfIssuesPerGranularity = issuesPerGranularity.reduce(
    (max, { issues }) => (max < issues.length ? issues.length : max),
    Number.MIN_SAFE_INTEGER,
  );

  const pairedUpDataPoints = [...pairUpDataPoints(issuesPerGranularity)];

  const [brushDomain, setBrushDomain] = React.useState<[Date, Date]>([minDate.toDate(), maxDate.toDate()]);

  // Reset brush when the underlying data range changes
  React.useEffect(() => {
    setBrushDomain([minDate.toDate(), maxDate.toDate()]);
  }, [minDate.valueOf(), maxDate.valueOf()]);

  const xScale = d3
    .scaleUtc()
    .range([margin * 2, width - margin * 2])
    .domain(brushDomain)
    .nice();

  // Compute Y domain from only the visible data points
  const visibleIssuesPerGranularity = issuesPerGranularity.filter(({ date }) => {
    const t = date.valueOf();
    return t >= brushDomain[0].getTime() && t <= brushDomain[1].getTime();
  });

  const visibleMax = visibleIssuesPerGranularity.reduce((max, { issues }) => (max < issues.length ? issues.length : max), 0);
  const yPadding = visibleMax * 0.05 || 1;

  const yScale = d3
    .scaleLinear()
    .range([height - legendBarHeight, margin])
    .domain([-yPadding, visibleMax + yPadding]);

  const xAxisRef = React.useRef<SVGGElement | null>(null);
  const yAxisRef = React.useRef<SVGGElement | null>(null);

  React.useEffect(() => {
    if (!xAxisRef.current || !yAxisRef.current) return;

    const TRANSITION_MS = 300;

    d3.select(xAxisRef.current).transition().duration(TRANSITION_MS).ease(d3.easeCubicOut).call(d3.axisBottom(xScale));

    d3.select(xAxisRef.current)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-35)')
      .attr('dx', '-0.4em')
      .attr('dy', '0.6em')
      .attr('fill', 'var(--color-base-content)')
      .attr('stroke', 'none');

    d3.select(xAxisRef.current).selectAll('path, line').attr('stroke', 'var(--color-base-content)');

    const yTicks = yScale.ticks().filter((t) => t >= 0 && Number.isInteger(t));
    d3.select(yAxisRef.current).transition().duration(TRANSITION_MS).ease(d3.easeCubicOut).call(d3.axisLeft(yScale).tickValues(yTicks));

    d3.select(yAxisRef.current).selectAll('text').attr('fill', 'var(--color-base-content)').attr('stroke', 'none');

    d3.select(yAxisRef.current).selectAll('path, line').attr('stroke', 'var(--color-base-content)');
  }, [xScale, yScale]);

  // Stable refs so the brush event handler always sees the latest scale/dates
  const brushRef = React.useRef<SVGGElement | null>(null);
  const xScaleRef = React.useRef(xScale);
  const minDateRef = React.useRef(minDate);
  const maxDateRef = React.useRef(maxDate);
  xScaleRef.current = xScale;
  minDateRef.current = minDate;
  maxDateRef.current = maxDate;

  React.useEffect(() => {
    if (!brushRef.current) return;

    let idleTimeout: number | null = null;

    const brush = d3
      .brushX()
      .extent([
        [margin * 2, 0],
        [width - margin * 2, height - legendBarHeight],
      ])
      .on('end', (e: d3.D3BrushEvent<unknown>) => {
        if (!e.sourceEvent) return;
        if (!e.selection) {
          if (!idleTimeout) {
            idleTimeout = window.setTimeout(() => {
              idleTimeout = null;
            }, 350);
            return;
          }
          setBrushDomain([minDateRef.current.toDate(), maxDateRef.current.toDate()]);
          return;
        }
        const [x0, x1] = e.selection as [number, number];
        setBrushDomain([xScaleRef.current.invert(x0), xScaleRef.current.invert(x1)]);
        d3.select(brushRef.current).call(brush.move, null);
      });

    d3.select(brushRef.current).call(brush);

    return () => {
      if (idleTimeout) window.clearTimeout(idleTimeout);
    };
  }, [width, height]);

  const handleDoubleClick = () => {
    setBrushDomain([minDate.toDate(), maxDate.toDate()]);
  };

  const [tooltipState, setTooltipState] = React.useState<{
    anchor: SVGElement;
    id: number;
  }>();

  const clipId = 'burndown-clip';

  return (
    <div style={{ height, width, position: 'relative' }}>
      <svg
        onDoubleClick={handleDoubleClick}
        xmlns="http://www.w3.org/2000/svg"
        width={'100%'}
        height={'100%'}
        viewBox={`0, 0, ${width}, ${height}`}>
        {height > 0 && width > 0 && (
          <>
            <defs>
              <clipPath id={clipId}>
                <rect x={margin * 2 - 5} y={-5} width={width - margin * 4 + 10} height={height - legendBarHeight + 10} />
              </clipPath>
            </defs>

            <g clipPath={`url(#${clipId})`}>
              {pairedUpDataPoints.map(([{ id: aId, date: aDate, issues: aIssues }, { id: bId, date: bDate, issues: bIssues }]) => (
                <g key={`${aId}_${bId}`}>
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
                </g>
              ))}

              <line
                x1={xScale(minDate)}
                y1={yScale(maxNumberOfIssuesPerGranularity)}
                x2={xScale(maxDate)}
                y2={yScale(0)}
                stroke={'green'}
                fill={'green'}
              />
            </g>

            <g ref={xAxisRef} transform={`translate(0, ${height - legendBarHeight})`} />
            <g ref={yAxisRef} transform={`translate(${margin * 2}, 0)`} />

            {showSprints && <SprintAreas sprints={sprints} xScale={xScale} height={height} bottomMargin={margin} />}

            <g ref={brushRef} />

            {/* Data points rendered after brush so they receive pointer events */}
            <g clipPath={`url(#${clipId})`}>
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

                  <BurndownChartDataPoint
                    cx={xScale(bDate)}
                    cy={yScale(bIssues.length)}
                    onClick={({ currentTarget }) => setTooltipState({ anchor: currentTarget, id: bId })}
                    active={bId === tooltipState?.id}
                  />
                </g>
              ))}
            </g>
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
