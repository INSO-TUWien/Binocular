import * as d3 from 'd3';
import * as React from 'react';
import { margin } from '../SprintChart';
import type { MappedDataPluginMergeRequest } from '../types';
import moment, { type Moment } from 'moment';
import type { AuthorType } from '../../../../../../types/data/authorType';
import classes from './sprintChartLegend.module.css';

export const SprintChartLegend: React.FC<{
  height: number;
  width: number;
  scale: d3.ScaleTime<number, number>;
  maxDate: Moment;
  minDate: Moment;
  groupedMergeRequests: MappedDataPluginMergeRequest[][];
  personColorMap: Map<string, AuthorType['color']>;
  coloringMode: string;
  onClickMergeRequest: (e: React.MouseEvent<SVGElement>, iid: number) => void;
}> = ({ height, width, scale, maxDate, minDate, groupedMergeRequests, personColorMap, coloringMode, onClickMergeRequest }) => (
  <>
    <rect x={margin} y={height - margin * 2} height={1} width={width - margin * 2} />

    <rect x={margin} y={height - margin * 2 + 1} width={width - margin * 2} height={40} fill={'#EEE'} />

    {scale.ticks().map((t) => {
      const x = scale(t);

      return (
        <g key={t.toISOString()}>
          <rect x={x} y={height - margin * 2} width={1} height={8} fill={'#000'} />
          <text x={x} y={height - margin} fontSize={10} textAnchor={'middle'}>
            {moment(t).format(maxDate.diff(minDate, 'years') > 1 ? 'YYYY' : 'MM.YYYY')}
          </text>
        </g>
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
        )?.main ?? 'lightgrey';

      return (
        <circle
          key={head.iid}
          className={classes['merge-request']}
          cx={x}
          cy={height - margin + 10}
          r={6}
          fill={tail.length === 0 ? color : 'lightgrey'}
          stroke={'darkgray'}
          onClick={(e) => {
            e.stopPropagation();

            onClickMergeRequest(e, head.iid);
          }}
        />
      );
    })}
  </>
);
