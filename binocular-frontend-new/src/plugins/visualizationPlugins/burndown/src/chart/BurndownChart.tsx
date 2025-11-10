import * as React from 'react';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import * as d3 from 'd3';
import type { BurndownSettings } from '../settings/settings';
import moment, { type Moment } from 'moment';
import type { SprintType } from '../../../../../types/data/sprintType';
import { SprintAreas } from '../../../sprints/src/chart/components/SprintAreas';

const legendBarHeight = 40;

const margin = 20;

export const BurndownChart: React.FC<
  {
    issues: DataPluginIssue[];
    sprints: SprintType[];
    minDate: Moment;
    maxDate: Moment;
    width: number;
    height: number;
  } & Pick<BurndownSettings, 'showSprints'>
> = ({ minDate, maxDate, showSprints, height, width, sprints }) => {
  const svgChartRef = React.useRef<SVGSVGElement>(null);

  const scale = d3.scaleUtc().range([margin, width]).domain([minDate, maxDate]);

  const mappedSprints = sprints.map((s) => ({
    ...s,

    startDate: moment(s.startDate),
    endDate: moment(s.endDate),
  }));

  return (
    <div style={{ height, width, position: 'relative' }}>
      <svg xmlns="http://www.w3.org/2000/svg" ref={svgChartRef} width={'100%'} height={'100%'} viewBox={`0, 0, ${width}, ${height}`}>
        {height > 0 && width > 0 && (
          <>
            <rect x={margin} y={height - legendBarHeight} height={1} width={width - margin * 2} />
            <rect x={margin} y={height + 1 - legendBarHeight} width={width - margin * 2} height={40} fill={'#EEE'} />
            {scale.ticks().map((t) => {
              const x = scale(t);

              return (
                <g key={t.toISOString()}>
                  <rect x={x} y={height - legendBarHeight} width={1} height={8} fill={'#000'} />
                  <text x={x} y={height - legendBarHeight / 2} fontSize={10} textAnchor={'middle'}>
                    {moment(t).format(maxDate.diff(minDate, 'years') > 1 ? 'YYYY' : 'MM.YYYY')}
                  </text>
                </g>
              );
            })}

            {showSprints && <SprintAreas sprints={mappedSprints} scale={scale} height={height} />}
          </>
        )}
      </svg>
    </div>
  );
};
