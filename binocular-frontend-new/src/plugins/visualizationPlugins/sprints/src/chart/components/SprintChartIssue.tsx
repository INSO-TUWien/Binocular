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

const spaceBetweenIssues = 4;
const marginBetweenLeftIssueBorderAndText = 4;
const verticalSpaceBetweenIssueTracks = 8;

export const SprintChartIssue: React.FC<
  MappedDataPluginIssue &
    Pick<SprintSettings, 'coloringMode'> & {
      height: number;
      zoom: number;
      width: number;
      offset: number;
      availableTracks: number;
      trackNmbr: number;
      xScale: d3.ScaleTime<number, number>;
      personColorMap: Map<string, AuthorType['color']>;
      onClick: (e: React.MouseEvent<SVGElement>, iid: number) => void;
    }
> = ({ height, zoom, offset, xScale, availableTracks, trackNmbr, personColorMap, coloringMode, onClick, labels, ...issue }) => {
  const h = Math.max(0, (height / availableTracks) * zoom);
  const w = Math.max(xScale(issue.closedAt) - xScale(issue.createdAt) - spaceBetweenIssues, 4);

  const x = xScale(issue.createdAt);
  const y = margin + offset + trackNmbr * h + trackNmbr * verticalSpaceBetweenIssueTracks;

  const personColor =
    personColorMap.get(
      (coloringMode === 'author'
        ? issue.author?.user?.gitSignature
        : coloringMode === 'assignee'
          ? issue.assignee?.user?.gitSignature
          : coloringMode === 'time-spent'
            ? findAuthorWithMaxSpentTime(
                aggregateTimeTrackingData(extractTimeTrackingDataFromNotes(issue.notes)).aggregatedTimeTrackingData,
              )
            : undefined) ?? '',
    )?.main ?? 'lightgrey';

  const issueElement = (
    <g
      key={issue.iid}
      className={classes.issue}
      onClick={(e) => {
        e.stopPropagation();

        onClick(e, issue.iid);
      }}>
      <rect
        width={w}
        height={h}
        x={x}
        y={y}
        fill={coloringMode === 'labels' ? `url(#hatch-${issue.iid})` : personColor}
        stroke={personColor}
        strokeWidth={2}
        rx={'0.2rem'}
      />
      <text
        x={x + marginBetweenLeftIssueBorderAndText}
        y={y + margin}
        width={w}
        height={h}
        style={{ display: h > 25 ? undefined : 'none' }}
        paintOrder={'stroke'}
        stroke={'white'}
        strokeWidth={2}>
        #{issue.iid}
      </text>
    </g>
  );

  return coloringMode === 'labels' ? (
    <>
      <defs>
        <pattern
          id={`hatch-${issue.iid}`}
          patternUnits={'userSpaceOnUse'}
          patternTransform={'rotate(45)'}
          width={8 * labels.length}
          height={'8'}>
          {labels.map(({ color }, i) => (
            <rect key={color} x={8 * i} y={'0'} width={8} height={'15'} stroke={'none'} fill={color} />
          ))}
        </pattern>
      </defs>
      {issueElement}
    </>
  ) : (
    issueElement
  );
};
