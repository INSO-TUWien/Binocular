import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { BarChartData, Palette } from './chart.tsx';
import { SumSettings } from '../settings/settings.tsx';
const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type BarChartProps = {
  width: number;
  height: number;
  data: BarChartData[];
  scale: number[];
  palette: Palette;
  settings: SumSettings;
};

export const ColumnChart = ({ width, height, data, scale, palette, settings }: BarChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  // Y axis
  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([scale[0], scale[1]]).range([boundsHeight, 0]);
  }, [boundsHeight, scale]);

  // X axis
  const alLUsers = Array.from(new Set(data.map((d) => d.user)));
  const xScale = useMemo(() => {
    return d3.scaleBand<string>().domain(alLUsers).range([0, boundsWidth]).paddingInner(0.01).paddingOuter(0.05);
  }, [alLUsers, boundsWidth]);

  let idleTimeout: number | null = null;
  function idled() {
    idleTimeout = null;
  }

  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [boundsWidth, boundsHeight],
    ])
    .on('end', (e) => {
      const svgElement = d3.select(svgRef.current);
      const extent = e.selection;

      if (!extent) {
        if (!idleTimeout) {
          idleTimeout = window.setTimeout(idled, 350);
          return;
        }
        xScale.domain(alLUsers);
      } else {
        const selectedUsers = alLUsers.filter((u) => {
          const x0 = xScale(u)!;
          const x1 = x0 + xScale.bandwidth();
          return x1 >= extent[0] && x0 <= extent[1];
        });
        if (selectedUsers.length) {
          xScale.domain(selectedUsers);
        }
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/unbound-method
      svgElement.select('.brush').call(brush.move, null);

      // d3/typescript sometimes does weird things and throws an error where no error is.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      svgElement.select('.xAxis').transition().duration(1000).call(d3.axisBottom(xScale));

      updateBars(
        palette,
        data.filter((d) => xScale.domain().includes(d.user)),
        xScale,
        yScale,
        svgRef,
      );
    });

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .append('g')
      .attr('class', 'xAxis')
      .attr('transform', `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'middle');

    svg
      .append('g')
      .attr('class', 'yAxis')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(scale[1] - scale[0])
          .tickFormat(d3.format('d')),
      );

    svg.append('g').attr('class', 'brush').call(brush);

    generateBars(palette, data, xScale, yScale, svgRef, tooltipRef);

    if (settings.showMean) {
      generateMeanLine(data, boundsWidth, yScale, svgRef);
    }
  }, [xScale, yScale, boundsHeight, settings.showMean, scale, brush, palette, data, boundsWidth]);

  return (
    <>
      <div
        ref={tooltipRef}
        style={{ position: 'fixed', visibility: 'hidden', border: '2px solid', padding: '.2rem', borderRadius: '4px', fontSize: '.75rem' }}>
        Tooltipp
      </div>
      <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
        <g width={boundsWidth} height={boundsHeight} ref={svgRef} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}></g>
      </svg>
    </>
  );
};

function generateBars(
  palette: Palette,
  data: { user: string; value: number; segments?: { label: string; value: number }[] }[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
  tooltipRef: MutableRefObject<null>,
) {
  const svg = d3.select(svgRef.current);
  const barWidth = x.bandwidth() / 2;
  const barOffset = x.bandwidth() / 4;

  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => x(d.user)! + barOffset)
    .attr('y', (d) => y(d.value))
    .attr('width', barWidth)
    .attr('height', (d) => y(0) - y(d.value))
    .attr('fill', (d) => palette[d.user]?.main)
    .on('mouseover', () => d3.select(tooltipRef.current).style('visibility', 'visible'))
    .on('mousemove', (e, d) =>
      d3
        .select(tooltipRef.current)
        .style('top', 20 + e.pageY + 'px')
        .style('left', e.pageX + 'px')
        .style('background', palette[d.user].secondary)
        .style('border-color', palette[d.user].secondary)
        .text(`${d.user}: ${d.value} Commits`),
    )
    .on('mouseout', () => d3.select(tooltipRef.current).style('visibility', 'hidden'))
    .filter((d) => d.segments && d.segments.length)
    .each(function (d) {
      const xPos = x(d.user)! + barOffset;
      let yPos = 0;
      d.segments?.forEach((seg) => {
        const h = y(0) - y(seg.value);
        svg
          .append('rect')
          .attr('class', 'bar')
          .attr('x', xPos)
          .attr('y', y(seg.value + yPos))
          .attr('width', barWidth)
          .attr('height', h)
          .attr('fill', palette[seg.label]?.main)
          .on('mouseover', () => d3.select(tooltipRef.current).style('visibility', 'visible'))
          .on('mousemove', (e, d) =>
            d3
              .select(tooltipRef.current)
              .style('top', 20 + e.pageY + 'px')
              .style('left', e.pageX + 'px')
              .style('background', palette[d.user].secondary)
              .style('border-color', palette[d.user].secondary)
              .text(`${d.user}: ${d.value} Commits`),
          )
          .on('mouseout', () => d3.select(tooltipRef.current).style('visibility', 'hidden'));
        yPos += seg.value;
      });
      d3.select(this).remove();
    });
}

function updateBars(
  palette: Palette,
  data: { user: string; value: number; segments?: { label: string; value: number }[] }[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
) {
  const svg = d3.select(svgRef.current);
  const barWidth = x.bandwidth() / 2;
  const barOffset = x.bandwidth() / 4;

  svg
    .selectAll<SVGRectElement, { user: string; value: number }>('.bar')
    .data(data, (d) => d.user)
    .join(
      (enter) =>
        enter
          .append('rect')
          .attr('class', 'bar')
          .attr('x', (d) => x(d.user)! + barOffset)
          .attr('y', (d) => y(d.value))
          .attr('width', barWidth)
          .attr('height', 0)
          .attr('fill', (d) => palette[d.user].main)
          .transition()
          .attr('y', (d) => y(d.value))
          .attr('height', (d) => y(0) - y(d.value)),
      (update) =>
        update
          .transition()
          .attr('x', (d) => x(d.user)! + barOffset)
          .attr('width', barWidth)
          .attr('y', (d) => y(d.value))
          .attr('height', (d) => y(0) - y(d.value)),
      (exit) => exit.transition().attr('height', 0).attr('y', y(0)).remove(),
    );
}

function generateMeanLine(
  data: { user: string; value: number }[],
  boundsWidth: number,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
) {
  const svg = d3.select(svgRef.current);
  const mean = d3.mean(data, (d) => d.value) ?? 0;

  svg
    .append('line')
    .attr('class', 'meanLine')
    .attr('x1', 0)
    .attr('x2', boundsWidth)
    .attr('stroke', '#ff3b30')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5')
    .attr('y1', y(mean))
    .attr('y2', y(mean));
}
