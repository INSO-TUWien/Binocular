import * as d3 from 'd3';
import * as React from 'react';
import { margin, legendBarHeight } from '../BurndownChart';

export const BurndownChartXAxisLegend: React.FC<{
  height: number;
  width: number;
  xScale: d3.ScaleTime<number, number, never>;
}> = ({ height, width, xScale }) => {
  const format = xScale.tickFormat();

  return (
    <g>
      <rect x={margin * 2} y={height - legendBarHeight} height={1} width={width - margin * 3} />
      <rect x={margin * 2} y={height + 1 - legendBarHeight} width={width - margin * 3} height={40} fill={'#EEE'} />
      {xScale.ticks().map((t) => {
        const x = xScale(t);

        return (
          <g key={t.toISOString()}>
            <rect x={x} y={height - legendBarHeight} width={1} height={8} fill={'#000'} />
            <text x={x} y={height - legendBarHeight / 2} fontSize={10} textAnchor={'middle'}>
              {format(t)}
            </text>
          </g>
        );
      })}
    </g>
  );
};
