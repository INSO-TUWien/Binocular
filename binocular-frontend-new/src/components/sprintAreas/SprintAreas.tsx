import { symbol, symbolTriangle } from 'd3';
import moment from 'moment';
import type React from 'react';
import classes from './sprintAreas.module.css';
import type { SprintType } from '../../types/data/sprintType';
import type { Moment } from 'moment';

const rectHeight = 15;
const triangleDimensions = 10;

const patternId = 'sprints-diagonal-hatch';

export type MappedSprint = Omit<SprintType, 'startDate' | 'endDate'> & Record<'startDate' | 'endDate', Moment>;

const mapSprint = (s: SprintType): MappedSprint => ({
  ...s,
  startDate: moment(s.startDate).startOf('day'),
  endDate: moment(s.endDate).startOf('day'),
});

export const SprintAreas: React.FC<{
  sprints: SprintType[];
  xScale: d3.ScaleTime<number, number>;
  height: number;
  onClick?: (sprint: MappedSprint) => React.MouseEventHandler<SVGGElement>;
  bottomMargin: number;
}> = ({ sprints, xScale, height, bottomMargin, onClick }) => {
  const trianglePath = symbol(symbolTriangle)() ?? '';
  const mappedSprints = sprints.map(mapSprint);

  return (
    <>
      <defs>
        <pattern id={patternId} patternUnits={'userSpaceOnUse'} width={8} height={8}>
          <path d={'M-1,1 l2,-2 M0,8 l8,-8 M3,5 l2,-2'} stroke={'var(--color-error)'} strokeWidth={1} />
        </pattern>
      </defs>

      {mappedSprints.map((s) => {
        const xStart = xScale(s.startDate);
        const yStart = 0;

        const xEnd = xScale(s.endDate);
        const yEnd = 0;

        return (
          <g key={s.id}>
            <g>
              <line x1={xStart} y1={yStart} x2={xStart} y2={height - bottomMargin * 2} width={1} stroke={'var(--color-success)'} />
              <path
                d={trianglePath}
                width={triangleDimensions}
                height={triangleDimensions}
                fill={'var(--color-success)'}
                // sub offset for the x direction, otherwise the triangle doesn't connect with the line.
                transform={`translate(${xStart + triangleDimensions / 2 - 2}, ${yStart + triangleDimensions / 2}) rotate(90)`}
              />
              <line x1={xEnd} y1={yEnd} x2={xEnd} y2={height - bottomMargin * 2} width={1} stroke={'var(--color-error)'} />
              <path
                d={trianglePath}
                width={triangleDimensions}
                height={triangleDimensions}
                fill={'var(--color-error)'}
                // add offset for the x direction, otherwise the triangle doesn't connect with the line.
                transform={`translate(${xEnd - triangleDimensions / 2 + 2}, ${yEnd + triangleDimensions / 2}) rotate(-90)`}
              />
            </g>

            <g onClick={onClick?.(s)} className={classes['sprint-area']}>
              <rect
                x={xStart}
                y={Math.max(0, height - bottomMargin * 2 - rectHeight)}
                height={rectHeight}
                width={xEnd - xStart}
                fill={'var(--color-base-100)'}
              />
              <rect
                x={xStart}
                y={Math.max(0, height - bottomMargin * 2 - rectHeight)}
                height={rectHeight}
                width={xEnd - xStart}
                fill={`url(#${patternId})`}
                stroke={'var(--color-error)'}
              />
              <text
                x={xStart + 4}
                // sub offset for the y direction so the text is positioned correctly
                y={Math.max(0, height - bottomMargin * 2 - 3)}
                fontSize={'0.75rem'}
                paintOrder={'stroke'}
                fill={'var(--color-base-content)'}
                stroke={'var(--color-base-100)'}
                strokeWidth={2}>
                {s.name}
              </text>
            </g>
          </g>
        );
      })}
    </>
  );
};
