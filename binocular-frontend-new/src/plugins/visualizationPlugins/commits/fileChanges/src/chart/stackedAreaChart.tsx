import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { type ScaleLinear, type ScaleTime } from 'd3';
import type { CommitChartData, Palette } from './chart.tsx';
import type { SprintType } from '../../../../../../types/data/sprintType.ts';
import type { SettingsType } from '../settings/settings.tsx';
import { PositiveNegativeSide, splitPositiveNegativeData } from '../utilities/dataConverter.ts';
import { round } from 'lodash';
import { SprintAreas } from '../../../../../../components/sprintAreas/SprintAreas.tsx';

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type AreaChartProps = {
  width: number;
  height: number;
  data: CommitChartData[];
  scale: number[];
  palette: Palette;
  sprintList: SprintType[];
  settings: SettingsType;
};

export const StackedAreaChart = ({ width, height, data, scale, palette, sprintList, settings }: AreaChartProps) => {
  // bounds = area inside the graph axis = calculated by subtracting the margins
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  // Y axis
  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([scale[0], scale[1]]).range([boundsHeight, 0]);
  }, [boundsHeight, scale]);

  // X axis
  const [xMin, xMax] = d3.extent(data, (d) => new Date(d.date).getTime());
  const [brushDomain, setBrushDomain] = useState<[number, number]>([xMin || 0, xMax || 0]);

  // Reset brushDomain when data changes
  useEffect(() => {
    setBrushDomain([xMin || 0, xMax || 0]);
  }, [xMin, xMax]);

  const xScale = useMemo(() => {
    return d3.scaleTime().domain(brushDomain).range([0, boundsWidth]);
  }, [boundsWidth, brushDomain]);

  let idleTimeout: number | null = null;
  function idled() {
    idleTimeout = null;
  }

  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on('end', (e) => {
      const svgElement = d3.select(svgRef.current);
      const extent = e.selection;
      if (!extent) {
        //This Timeout is necessary because it not the reset of the brush would trigger the reset of the domain
        // and the brushing wouldn't work.
        if (!idleTimeout) return (idleTimeout = window.setTimeout(idled, 350));
        setBrushDomain([xMin || 0, xMax || 0]);
      } else {
        const newDomain: [number, number] = [xScale.invert(extent[0]).getTime(), xScale.invert(extent[1]).getTime()];
        svgElement.select<SVGGElement>('.brush').call(brush.move.bind(this), null);
        setBrushDomain(newDomain);
      }
    });

  // Render the X and Y axis using d3.js, not react
  useEffect(() => {
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();
    svgElement
      .append('g')
      .attr('class', 'xAxis')
      .attr('transform', 'translate(0,' + boundsHeight + ')')
      .call(d3.axisBottom(xScale));
    svgElement.append('g').call(d3.axisLeft(yScale));
    svgElement.append('g').attr('class', 'brush').call(brush);

    generateDataLines(palette, data, settings.visualizationStyle, xScale, yScale, svgRef, tooltipRef);
  }, [xScale, yScale, boundsHeight]);

  return (
    <>
      <div
        ref={tooltipRef}
        style={{ position: 'fixed', visibility: 'hidden', border: '2px solid', padding: '.2rem', borderRadius: '4px', fontSize: '.75rem' }}>
        Tooltip
      </div>
      <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
        <g width={boundsWidth} height={boundsHeight} ref={svgRef} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}></g>
        {settings.showSprints && (
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            <SprintAreas sprints={sprintList} xScale={xScale} height={boundsHeight} bottomMargin={0} />
          </g>
        )}
      </svg>
    </>
  );
};

function generateDataLines(
  palette: Palette,
  data: CommitChartData[],
  visualizationStyle: string,
  xScale: ScaleTime<number, number, never>,
  yScale: ScaleLinear<number, number, never>,
  svgRef: MutableRefObject<null>,
  tooltipRef: MutableRefObject<null>,
) {
  const svgElement = d3.select(svgRef.current);
  const stackedPositiveData = d3.stack().keys(Object.keys(palette))(splitPositiveNegativeData(data, PositiveNegativeSide.POSITIVE));
  const stackedNegativeData = d3.stack().keys(Object.keys(palette))(splitPositiveNegativeData(data, PositiveNegativeSide.NEGATIVE));
  Object.keys(palette).forEach((author, i) => {
    const areaBuilderPositive = d3
      .area<CommitChartData>()
      .curve(visualizationStyle === 'curved' ? d3.curveMonotoneX : visualizationStyle === 'stepped' ? d3.curveStep : d3.curveLinear)
      .x((d) => xScale(new Date(d.date).getTime()))
      .y1((_d, j) => yScale(stackedPositiveData[i][j][0]))
      .y0((_d, j) => yScale(stackedPositiveData[i][j][1]));
    svgElement
      .append('path')
      .datum(data)
      .attr('class', `positiveChartArea${i}`)
      .attr('fill', palette[author].main)
      .attr('fill-opacity', 0.3)
      .attr('stroke', palette[author].main)
      .attr('stroke-width', 1)
      .attr('d', areaBuilderPositive)
      .on('mouseover', () => {
        return d3.select(tooltipRef.current).style('visibility', 'visible');
      })
      .on('mousemove', (e: MouseEvent, d: CommitChartData[]) => {
        const [x] = d3.pointer(e);
        const closestIndex = getClosestIndex(x, d, xScale);
        return d3
          .select(tooltipRef.current)
          .style('top', 20 + e.pageY + 'px')
          .style('left', e.pageX + 'px')
          .style('background', palette[author].secondary)
          .style('border-color', palette[author].secondary)
          .text(`${author}: ${round(d[closestIndex][author])}`);
      })
      .on('mouseout', () => {
        return d3.select(tooltipRef.current).style('visibility', 'hidden');
      });

    const areaBuilderNegative = d3
      .area<CommitChartData>()
      .curve(visualizationStyle === 'curved' ? d3.curveMonotoneX : visualizationStyle === 'stepped' ? d3.curveStep : d3.curveLinear)
      .x((d) => xScale(new Date(d.date).getTime()))
      .y1((_d, j) => yScale(stackedNegativeData[i][j][0]))
      .y0((_d, j) => yScale(stackedNegativeData[i][j][1]));
    svgElement
      .append('path')
      .datum(data)
      .attr('class', `negativeChartArea${i}`)
      .attr('fill', palette[author].main)
      .attr('fill-opacity', 0.3)
      .attr('stroke', palette[author].main)
      .attr('stroke-width', 1)
      .attr('d', areaBuilderNegative)
      .on('mouseover', () => {
        return d3.select(tooltipRef.current).style('visibility', 'visible');
      })
      .on('mousemove', (e: MouseEvent, d: CommitChartData[]) => {
        const [x] = d3.pointer(e);
        const closestIndex = getClosestIndex(x, d, xScale);
        return d3
          .select(tooltipRef.current)
          .style('top', 20 + e.pageY + 'px')
          .style('left', e.pageX + 'px')
          .style('background', palette[author].secondary)
          .style('border-color', palette[author].secondary)
          .text(`${author}: ${round(-d[closestIndex][author])}`);
      })
      .on('mouseout', () => {
        return d3.select(tooltipRef.current).style('visibility', 'hidden');
      });
  });
}

function getClosestIndex(x: number, data: CommitChartData[], xScale: ScaleTime<number, number, never>) {
  const targetTimestamp = Math.round(xScale.invert(x).getTime());
  const timestamps = data.map((d) => new Date(d.date).getTime());

  let closestIndex = 0;
  let minDiff = Math.abs(timestamps[0] - targetTimestamp);

  for (let i = 1; i < timestamps.length; i++) {
    const diff = Math.abs(timestamps[i] - targetTimestamp);
    if (diff < minDiff) {
      closestIndex = i;
      minDiff = diff;
    }
  }
  return closestIndex;
}
