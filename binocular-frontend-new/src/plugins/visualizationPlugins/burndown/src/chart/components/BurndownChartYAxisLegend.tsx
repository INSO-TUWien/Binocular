import * as d3 from 'd3';
import * as React from 'react';
import { margin } from '../BurndownChart';

export const BurndownChartYAxisLegend: React.FC<{ height: number; yScale: d3.ScaleLinear<number, number> }> = ({ height, yScale }) => (
  <>
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
  </>
);
