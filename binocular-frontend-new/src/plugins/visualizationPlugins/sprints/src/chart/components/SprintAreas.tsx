import type React from 'react';
import { symbol, symbolTriangle } from 'd3';
import classes from './sprintArea.module.css';
import type { MappedSprintType } from '../types';

export const SprintAreas: React.FC<{
  sprints: MappedSprintType[];
  xScale: d3.ScaleTime<number, number>;
  height: number;
  onClick?: (e: React.MouseEvent<SVGGElement>, sprint: MappedSprintType) => void;
}> = ({ sprints, xScale, height, onClick }) => (
  <>
    <defs>
      <pattern id={'diagonalHatch'} patternUnits={'userSpaceOnUse'} width={8} height={8}>
        <path d="M-1,1 l2,-2 M0,8 l8,-8 M3,5 l2,-2" stroke="#FF3B30" strokeWidth={1} />
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
            d={symbol(symbolTriangle)() ?? ''}
            width={10}
            height={10}
            fill={'#4CD964'}
            transform={`translate(${xStart + 4}, ${yStart + 5}) rotate(90)`}
          />
          <rect x={xEnd} y={yEnd} height={height - 40} width={1} fill={'#FF3B30'} />
          <path
            d={symbol(symbolTriangle)() ?? ''}
            width={10}
            height={10}
            fill={'#FF3B30'}
            transform={`translate(${xEnd - 3}, ${yEnd + 5}) rotate(-90)`}
          />

          <g
            onClick={(e) => {
              e.stopPropagation();

              onClick?.(e, s);
            }}>
            <rect x={xStart} y={Math.max(0, height - 40 - 15)} height={15} width={xEnd - xStart} fill={'white'} />
            <rect
              x={xStart}
              y={Math.max(0, height - 40 - 15)}
              height={15}
              width={xEnd - xStart}
              fill={'url(#diagonalHatch)'}
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
