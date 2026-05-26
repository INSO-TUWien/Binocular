import * as d3 from 'd3';
import * as React from 'react';
import { margin } from '../BurndownChart';

export const BurndownChartYAxisLegend: React.FC<{ height: number; yScale: d3.ScaleLinear<number, number>; maxValue: number }> = ({
  height,
  yScale,
  maxValue,
}) => {
  const ticks = yScale.ticks().filter((t) => t <= maxValue);
  const yPositions = ticks.map((t) => yScale(t));
  const topY = yScale(maxValue);
  const bottomY = yPositions.length > 0 ? Math.max(...yPositions) : height - margin * 2;
  return (
    <g>
      <rect x={margin * 2} y={topY} height={bottomY - topY} width={1} fill={'var(--color-base-content)'} />
      <rect x={0} y={0} width={margin * 2} height={height} fill={'var(--color-base-100)'} />
      {yScale
        .ticks()
        .filter((t) => t >= 0 && t <= maxValue)
        .map((t) => {
          const y = yScale(t);

          return (
            <g key={t}>
              <rect x={margin * 2 - 8} y={y} width={8} height={1} fill={'var(--color-base-content)'} />
              <text x={margin} y={y} fontSize={10} textAnchor={'middle'} alignmentBaseline={'central'} fill={'var(--color-base-content)'}>
                {t}
              </text>
            </g>
          );
        })}
    </g>
  );
};
