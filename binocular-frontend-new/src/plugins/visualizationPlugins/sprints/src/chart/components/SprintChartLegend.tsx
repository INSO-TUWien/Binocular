import * as d3 from 'd3';
import * as React from 'react';
import { margin } from '../SprintChart';
import type { MappedDataPluginMergeRequest } from '../types';
import moment, { type Moment } from 'moment';
import { AuthorType } from '../../../../../../types/data/authorType';

export const SprintChartLegend: React.FC<{
  height: number;
  width: number;
  scale: d3.ScaleTime<number, number>;
  maxDate: Moment;
  minDate: Moment;
  groupedMergeRequests: MappedDataPluginMergeRequest[][];
  personColorMap: Map<string, AuthorType['color']>;
  coloringMode: string;
}> = ({
  height,
  width,
  scale,
  maxDate,
  minDate,
  groupedMergeRequests,
  personColorMap,
  coloringMode,
}) => (
  <>
    <rect
      x={margin}
      y={height - margin * 2}
      width={width - margin * 2}
      height={80}
      fill={'#EEE'}
    />

    {scale.ticks().map((t) => {
      const x = scale(t);

      return (
        <text key={t.toISOString()} x={x} y={height - margin} fontSize={10}>
          {moment(t).format(
            maxDate.diff(minDate, 'years') > 1 ? 'YYYY' : 'MM.YYYY',
          )}
        </text>
      );
    })}

    {groupedMergeRequests.map(([head, ...tail]) => {
      const x = scale(head.createdAt);

      const color =
        personColorMap.get(
          (coloringMode === 'author'
            ? head.author.user?.gitSignature
            : coloringMode === 'assignee'
              ? head.assignee?.user?.gitSignature
              : undefined) ?? '',
        )?.main ?? 'lightgray';

      return (
        <circle
          key={head.iid}
          cx={x}
          cy={height - margin + 10}
          r={6}
          fill={tail.length === 0 ? color : 'lightgray'}
          stroke={'darkgray'}
        />
      );
    })}
  </>
);
