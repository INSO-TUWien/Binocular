import * as d3 from 'd3';
import * as React from 'react';
import { margin, legendBarHeight } from '../BurndownChart';

export const BurndownChartXAxisLegend: React.FC<{
  height: number;
  width: number;
  xScale: d3.ScaleTime<number, number, never>;
}> = ({ height, width, xScale }) => {
  const format = xScale.tickFormat();
  const [domainMin, domainMax] = xScale.domain();
  const leftX = xScale(domainMin);
  const rightX = xScale(domainMax);
  const ticks = xScale.ticks();

  return (
    <g>
      <rect x={leftX} y={height - legendBarHeight} height={1} width={rightX - leftX} fill={'var(--color-base-content)'} />
      <rect
        x={margin * 2}
        y={height + 1 - legendBarHeight}
        width={width - margin * 4}
        height={legendBarHeight}
        fill={'var(--color-base-100)'}
      />
      {ticks.map((t) => {
        const x = xScale(t);
        const axisY = height - legendBarHeight;

        return (
          <g key={t.toISOString()}>
            <rect x={x} y={axisY} width={1} height={8} fill={'var(--color-base-content)'} />
            <g transform={`translate(${x}, ${axisY})`}>
              <text
                y={9}
                dy={'0.6em'}
                dx={'-0.4em'}
                fontSize={10}
                textAnchor={'end'}
                fill={'var(--color-base-content)'}
                transform={'rotate(-35)'}>
                {format(t)}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};
