import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Commit } from '../../../../interfaces/dataPlugin.ts';

/**
 * Example from https://www.react-graph-gallery.com/area-plot
 */

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type AreaChartProps = {
  width: number;
  height: number;
  data: Commit[];
  color: string;
};

export const AreaChart = ({ width, height, data, color }: AreaChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis
  const [min, max] = d3.extent(data, (d) => d.stats.additions + d.stats.deletions);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([min && min < 0 ? min : 0, max && max > 0 ? max : 0])
      .range([boundsHeight, 0]);
  }, [boundsHeight, max, min]);

  // X axis
  const [xMin, xMax] = d3.extent(data, (d) => new Date(d.date).getTime());
  const xScale = useMemo(() => {
    return d3
      .scaleTime()
      .domain([xMin || 0, xMax || 0])
      .range([0, boundsWidth]);
  }, [boundsWidth, xMax, xMin]);

  // Render the X and Y axis using d3.js, not react
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll('*').remove();
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append('g')
      .attr('transform', 'translate(0,' + boundsHeight + ')')
      .call(xAxisGenerator);

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement.append('g').call(yAxisGenerator);
  }, [xScale, yScale, boundsHeight]);

  // Build the line
  const areaBuilder = d3
    .area<Commit>()
    .x((d) => xScale(new Date(d.date).getTime()))
    .y1((d) => yScale(d.stats.additions + d.stats.deletions))
    .y0(yScale(0));
  const areaPath = areaBuilder(data);

  // Build the line
  const lineBuilder = d3
    .line<Commit>()
    .x((d) => xScale(new Date(d.date).getTime()))
    .y((d) => yScale(d.stats.additions + d.stats.deletions));
  const linePath = lineBuilder(data);

  if (!linePath || !areaPath) {
    return null;
  }

  return (
    <div>
      <svg width={width} height={height}>
        <g width={boundsWidth} height={boundsHeight} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}>
          <path d={areaPath} opacity={1} stroke={'none'} fill={color} fillOpacity={0.4} />
          <path d={linePath} opacity={1} stroke={color} fill={'none'} strokeWidth={2} />
        </g>
        <g width={boundsWidth} height={boundsHeight} ref={axesRef} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`} />
      </svg>
    </div>
  );
};
