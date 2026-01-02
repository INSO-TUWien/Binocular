import type React from 'react';
import { symbol, symbolTriangle } from 'd3';
import classes from './sprintArea.module.css';
import type { MappedSprint } from '../types';

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
        <pattern id={'sprints-diagonal-hatch'} patternUnits={'userSpaceOnUse'} width={8} height={8}>
          <path d={'M-1,1 l2,-2 M0,8 l8,-8 M3,5 l2,-2'} stroke={'#FF3B30'} strokeWidth={1} />
        </pattern>
      </defs>

      {sprints.map((s) => {
        const xStart = xScale(s.startDate);
        const yStart = 0;

        const xEnd = xScale(s.endDate);
        const yEnd = 0;

        return (
          <g key={s.id} className={classes['sprint-area']}>
            <rect x={xStart} y={yStart} height={height - 40} width={1} fill={'#4CD964'} />
            <path
              d={trianglePath}
              width={10}
              height={10}
              fill={'#4CD964'}
              transform={`translate(${xStart + 4}, ${yStart + 5}) rotate(90)`}
            />
            <rect x={xEnd} y={yEnd} height={height - 40} width={1} fill={'#FF3B30'} />
            <path d={trianglePath} width={10} height={10} fill={'#FF3B30'} transform={`translate(${xEnd - 3}, ${yEnd + 5}) rotate(-90)`} />

            <g onClick={onClick?.(s)}>
              <rect x={xStart} y={Math.max(0, height - 40 - 15)} height={15} width={xEnd - xStart} fill={'white'} />
              <rect
                x={xStart}
                y={Math.max(0, height - 40 - 15)}
                height={15}
                width={xEnd - xStart}
                fill={'url(#sprints-diagonal-hatch)'}
                stroke={'#FF3B30'}
              />
              <text
                x={xStart + 4}
                y={Math.max(0, height - 40 - 4)}
                height={10}
                fontSize={'0.75rem'}
                paintOrder={'stroke'}
                stroke={'white'}
                strokeWidth={4}>
                {s.name}
              </text>
            </g>
          </g>
        );
      })}
    </>
  );
};
