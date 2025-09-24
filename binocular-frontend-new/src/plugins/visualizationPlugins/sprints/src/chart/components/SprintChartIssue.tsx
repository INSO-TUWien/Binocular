import * as d3 from 'd3';
import * as React from 'react';
import type { AuthorType } from '../../../../../../types/data/authorType';
import { extractTimeTrackingDataFromNotes } from '../../../../timeSpent/src/utilities/dataConverter';
import type { SprintSettings } from '../../settings/settings';
import {
  margin,
} from '../SprintChart';
import { findAuthorWithMaxSpentTime } from '../helper/findAuthorWithMaxSpentTime';
import { aggregateTimeTrackingData } from '../helper/aggregateTimeTrackingData';
import type { MappedDataPluginIssue } from '../types';
import classes from './sprintChartIssue.module.css'

export const SprintChartIssue: React.FC<
  MappedDataPluginIssue &
    Pick<SprintSettings, 'coloringMode'> & {
      height: number;
      zoom: number;
      width: number;
      offset: number;
      availableTracks: number;
      trackNmbr: number;
      scale: d3.ScaleTime<number, number>;
      personColorMap: Map<string, AuthorType['color']>;
    }
> = ({
  height,
  zoom,
  width,
  offset,
  scale,
  availableTracks,
  trackNmbr,
  personColorMap,
  coloringMode,
  ...d
}) => {
  const h = Math.max(0, ((height - 110) / availableTracks - 2) * zoom);

  const x = scale(d.createdAt);
  const y =
    (30 + (trackNmbr * height - 110) / availableTracks - 2) * zoom + offset;

  const { aggregatedTimeTrackingData } = aggregateTimeTrackingData(
    extractTimeTrackingDataFromNotes(d.notes),
  );

  const color =
    personColorMap.get(
      (coloringMode === 'author'
        ? d.author.user?.gitSignature
        : coloringMode === 'assignee'
          ? d.assignee?.user?.gitSignature
          : coloringMode === 'time-spent'
            ? findAuthorWithMaxSpentTime(aggregatedTimeTrackingData)
            : undefined) ?? '',
    )?.main ?? 'lightgray';

  return (
    <g key={d.iid} className={classes.issue}>
      <rect
        width={Math.max(
          scale(d.closedAt) - scale(d.createdAt) - 4,
          h / availableTracks - 2,
          4,
        )}
        height={h}
        x={x}
        y={y}
        fill={color}
        stroke={color}
        strokeWidth={2}
        rx={'0.2rem'}
      />
      <text
        x={x + 4}
        y={y + margin}
        width={Math.max(scale(d.closedAt) - scale(d.createdAt) - 4, 1)}
        height={h}
        style={{ display: h > 25 ? undefined : 'none' }}
      >
        #{d.iid}
      </text>
    </g>
  );
};
