import * as d3 from 'd3';
import moment, { type Moment } from 'moment';
import * as React from 'react';
import { margin, legendBarHeight } from '../BurndownChart';

export const BurndownChartXAxisLegend: React.FC<{
  height: number;
  width: number;
  xScale: d3.ScaleTime<number, number, never>;
  maxDate: Moment;
  minDate: Moment;
}> = ({ height, maxDate, minDate, width, xScale }) => (
  <>
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
  </>
);
