import * as d3 from 'd3';
import * as React from 'react';
import { margin } from '../SprintChart';

export const SprintChartLegend: React.FC<{
  height: number;
  width: number;
  xScale: d3.ScaleTime<number, number>;
}> = ({ height, width, xScale }) => {
  const format = xScale.tickFormat();

  return (
    <g>
      <rect x={margin} y={height - margin * 2} height={1} width={width - margin * 2} />

      <rect x={margin} y={height - margin * 2 + 1} width={width - margin * 2} height={40} fill={'#EEE'} />

      {xScale.ticks().map((tick) => {
        const x = xScale(tick);

        return (
          <g key={tick.toISOString()}>
            <rect x={x} y={height - margin * 2} width={1} height={8} fill={'#000'} />
            <text x={x} y={height - margin} fontSize={10} textAnchor={'middle'}>
              {format(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
};
