import * as d3 from 'd3';
import * as React from 'react';
import { margin } from '../SprintChart';
import moment, { type Moment } from 'moment';

export const SprintChartLegend: React.FC<{
  height: number;
  width: number;
  xScale: d3.ScaleTime<number, number>;
  maxDate: Moment;
  minDate: Moment;
}> = ({ height, width, xScale, maxDate, minDate }) => (
  <>
    <rect x={margin} y={height - margin * 2} height={1} width={width - margin * 2} />

    <rect x={margin} y={height - margin * 2 + 1} width={width - margin * 2} height={40} fill={'#EEE'} />

    {xScale.ticks().map((t) => {
      const x = xScale(t);

      return (
        <g key={t.toISOString()}>
          <rect x={x} y={height - margin * 2} width={1} height={8} fill={'#000'} />
          <text x={x} y={height - margin} fontSize={10} textAnchor={'middle'}>
            {moment(t).format(maxDate.diff(minDate, 'years') > 1 ? 'YYYY' : 'MM.YYYY')}
          </text>
        </g>
      );
    })}
  </>
);
