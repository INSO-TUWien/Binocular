import * as d3 from 'd3';
import * as React from 'react';
import { margin } from '../SprintChart';
import type { MappedDataPluginMergeRequest } from '../types';
import type { AuthorType } from '../../../../../../types/data/authorType';
import classes from './sprintChartMergeRequest.module.css';

export const SprintChartMergeRequest: React.FC<{
  height: number;
  xScale: d3.ScaleTime<number, number>;
  mergeRequestGroup: MappedDataPluginMergeRequest[];
  personColorMap: Map<string, AuthorType['color']>;
  coloringMode: string;
  onClick: React.MouseEventHandler<SVGCircleElement>;
}> = ({ height, xScale, mergeRequestGroup: [head, ...tail], personColorMap, coloringMode, onClick }) => {
  const x = xScale(head.createdAt);

  const color =
    personColorMap.get(
      (coloringMode === 'author'
        ? head.author?.user?.gitSignature
        : coloringMode === 'assignee'
          ? head.assignee?.user?.gitSignature
          : undefined) ?? '',
    )?.main ?? 'lightgrey';

  return (
    <circle
      key={head.iid}
      className={classes['merge-request']}
      cx={x}
      cy={height - margin / 2}
      r={6}
      fill={tail.length === 0 ? color : 'lightgrey'}
      stroke={'darkgray'}
      onClick={onClick}
    />
  );
};
