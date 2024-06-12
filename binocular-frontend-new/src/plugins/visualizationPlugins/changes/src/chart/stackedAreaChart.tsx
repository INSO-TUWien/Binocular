import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { CommitChartData, Palette } from './chart.tsx';

/**
 * Example from https://www.react-graph-gallery.com/area-plot
 */

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type AreaChartProps = {
  width: number;
  height: number;
  data: CommitChartData[];
  scale: number[];
  palette: Palette;
};

export const StackedAreaChart = ({ width, height, data, scale, palette }: AreaChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const svgRef = useRef(null);
  const tooltippRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis
  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([scale[0], scale[1]]).range([boundsHeight, 0]);
  }, [boundsHeight, scale]);

  // X axis
  const [xMin, xMax] = d3.extent(data, (d) => new Date(d.date).getTime());
  const xScale = useMemo(() => {
    return d3
      .scaleTime()
      .domain([xMin || 0, xMax || 0])
      .range([0, boundsWidth]);
  }, [boundsWidth, xMax, xMin]);

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
        xScale.domain([xMin || 0, xMax || 0]);
      } else {
        xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])]);
        svgElement.select('.brush').remove();
        svgElement.append('g').attr('class', 'brush').call(brush);
      }
      // d3/typescript sometimes does weird things and throws an error where no error is.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      svgElement.select('.xAxis').transition().duration(1000).call(d3.axisBottom(xScale));
      const stackedData = d3.stack().keys(Object.keys(palette))(data);
      Object.keys(palette).forEach((_author, i) => {
        const areaBuilder = d3
          .area<CommitChartData>()
          .curve(d3.curveBasis)
          .x((d) => xScale(new Date(d.date).getTime()))
          .y1((_d, j) => yScale(stackedData[i][j][0]))
          .y0((_d, j) => yScale(stackedData[i][j][1]));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        svgElement.select(`.chartArea${i}`).transition().duration(1000).attr('d', areaBuilder);
      });
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

    const stackedData = d3.stack().keys(Object.keys(palette))(data);
    Object.keys(palette).forEach((author, i) => {
      const areaBuilder = d3
        .area<CommitChartData>()
        .curve(d3.curveBasis)
        .x((d) => xScale(new Date(d.date).getTime()))
        .y1((_d, j) => yScale(stackedData[i][j][0]))
        .y0((_d, j) => yScale(stackedData[i][j][1]));
      svgElement
        .append('path')
        .datum(data)
        .attr('class', `chartArea${i}`) // I add the class myArea to be able to modify it later on.
        .attr('fill', palette[author].main)
        .attr('fill-opacity', 0.3)
        .attr('stroke', palette[author].main)
        .attr('stroke-width', 1)
        .attr('d', areaBuilder)
        .on('mouseover', () => {
          return d3.select(tooltippRef.current).style('visibility', 'visible');
        })
        .on('mousemove', (e) => {
          return d3
            .select(tooltippRef.current)
            .style('top', 20 + e.pageY + 'px')
            .style('left', e.pageX + 'px')
            .style('background', palette[author].secondary)
            .style('border-color', palette[author].secondary)
            .text(author);
        })
        .on('mouseout', () => {
          return d3.select(tooltippRef.current).style('visibility', 'hidden');
        });
    });
  }, [xScale, yScale, boundsHeight]);

  return (
    <div>
      <div
        ref={tooltippRef}
        style={{ position: 'fixed', visibility: 'hidden', border: '2px solid', padding: '.2rem', borderRadius: '4px', fontSize: '.75rem' }}>
        Tooltipp
      </div>
      <svg width={width} height={height}>
        <g width={boundsWidth} height={boundsHeight} ref={svgRef} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}></g>
      </svg>
    </div>
  );
};
