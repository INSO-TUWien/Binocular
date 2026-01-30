import type React from 'react';
import { symbol, symbolTriangle } from 'd3';
import classes from './sprintArea.module.css';
import type { MappedSprint } from '../types';
import { margin } from '../SprintChart';

const rectHeight = 15;
const triangleDimensions = 10;

const patternId = 'sprints-diagonal-hatch';

export const SprintAreas: React.FC<{
  sprints: MappedSprint[];
  xScale: d3.ScaleTime<number, number>;
  height: number;
  onClick?: (sprint: MappedSprint) => React.MouseEventHandler<SVGGElement>;
}> = ({ sprints, xScale, height, onClick }) => {
  const trianglePath = symbol(symbolTriangle)() ?? '';

  return (
    <>
      <defs>
        <pattern id={patternId} patternUnits={'userSpaceOnUse'} width={8} height={8}>
          <path d={'M-1,1 l2,-2 M0,8 l8,-8 M3,5 l2,-2'} stroke={'#FF3B30'} strokeWidth={1} />
        </pattern>
      </defs>

      {sprints.map((s) => {
        const xStart = xScale(s.startDate);
        const yStart = 0;

        const xEnd = xScale(s.endDate);
        const yEnd = 0;

        return (
          <g key={s.id}>
            <g>
              <line x1={xStart} y1={yStart} x2={xStart} y2={height - margin * 2} width={1} stroke={'#4CD964'} />
              <path
                d={trianglePath}
                width={triangleDimensions}
                height={triangleDimensions}
                fill={'#4CD964'}
                // sub offset for the x direction, otherwise the triangle doesn't connect with the line.
                transform={`translate(${xStart + triangleDimensions / 2 - 2}, ${yStart + triangleDimensions / 2}) rotate(90)`}
              />
              <line x1={xEnd} y1={yEnd} x2={xEnd} y2={height - margin * 2} width={1} stroke={'#FF3B30'} />
              <path
                d={trianglePath}
                width={triangleDimensions}
                height={triangleDimensions}
                fill={'#FF3B30'}
                // add offset for the x direction, otherwise the triangle doesn't connect with the line.
                transform={`translate(${xEnd - triangleDimensions / 2 + 2}, ${yEnd + triangleDimensions / 2}) rotate(-90)`}
              />
            </g>

            <g onClick={onClick?.(s)} className={classes['sprint-area']}>
              <rect x={xStart} y={Math.max(0, height - margin * 2 - rectHeight)} height={rectHeight} width={xEnd - xStart} fill={'white'} />
              <rect
                x={xStart}
                y={Math.max(0, height - margin * 2 - rectHeight)}
                height={rectHeight}
                width={xEnd - xStart}
                fill={`url(#${patternId})`}
                stroke={'#FF3B30'}
              />
              <text
                x={xStart + 4}
                // sub offset for the y direction so the text is positioned correctly
                y={Math.max(0, height - margin * 2 - 3)}
                fontSize={'0.75rem'}
                paintOrder={'stroke'}
                stroke={'white'}
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
