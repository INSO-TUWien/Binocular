import * as d3 from 'd3';
import * as React from 'react';
import type { AuthorType } from '../../../../../../types/data/authorType';
import { extractTimeTrackingDataFromNotes } from '../../../../timeSpent/src/utilities/dataConverter';
import type { SprintSettings } from '../../settings/settings';
import { margin } from '../SprintChart';
import { findAuthorWithMaxSpentTime } from '../helper/findAuthorWithMaxSpentTime';
import { aggregateTimeTrackingData } from '../helper/aggregateTimeTrackingData';
import type { MappedDataPluginIssue } from '../types';
import classes from './sprintChartIssue.module.css';

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
      onClick: (e: React.MouseEvent<SVGElement>, iid: number) => void;
    }
> = ({ height, zoom, offset, scale, availableTracks, trackNmbr, personColorMap, coloringMode, onClick, labels, ...d }) => {
  const h = Math.max(0, ((height - 110) / availableTracks - 2) * zoom);

  const x = scale(d.createdAt);
  const y = (margin + (trackNmbr * (height - 110)) / availableTracks - 2) * zoom + offset + trackNmbr * 8;

  const { aggregatedTimeTrackingData } = aggregateTimeTrackingData(extractTimeTrackingDataFromNotes(d.notes));

  const color =
    personColorMap.get(
      (coloringMode === 'author'
        ? d.author?.user?.gitSignature
        : coloringMode === 'assignee'
          ? d.assignee?.user?.gitSignature
          : coloringMode === 'time-spent'
            ? findAuthorWithMaxSpentTime(aggregatedTimeTrackingData)
            : undefined) ?? '',
    )?.main ?? 'lightgrey';

  const issue = (
    <g
      key={d.iid}
      className={classes.issue}
      onClick={(e) => {
        e.stopPropagation();

        onClick(e, d.iid);
      }}>
      <rect
        width={Math.max(scale(d.closedAt) - scale(d.createdAt) - 4, h / availableTracks - 2, 4)}
        height={h}
        x={x}
        y={y}
        fill={coloringMode === 'labels' ? `url(#hatch-${d.iid})` : color}
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
        paintOrder={'stroke'}
        stroke={'white'}
        strokeWidth={2}>
        #{d.iid}
      </text>
    </g>
  );

  return coloringMode === 'labels' ? (
    <>
      <defs>
        <pattern
          id={`hatch-${d.iid}`}
          patternUnits={'userSpaceOnUse'}
          patternTransform={'rotate(45)'}
          width={8 * labels.length}
          height={'8'}>
          {labels.map(({ color }, i) => (
            <rect key={color} x={8 * i} y={'0'} width={8} height={'15'} stroke={'none'} fill={color} />
          ))}
        </pattern>
      </defs>
      {issue}
    </>
  ) : (
    issue
  );
};
