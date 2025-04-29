import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { ScaleBand, ScaleLinear, ScaleTime, symbol, symbolTriangle } from 'd3';
import { ChartData, Palette } from './chart.tsx';
import { SprintType } from '../../../../../types/data/sprintType.ts';
import { DefaultSettings } from '../settings/settings.tsx';
const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type BarChartProps = {
  width: number;
  height: number;
  data: ChartData[];
  scale: number[];
  palette: Palette;
  sprintList: SprintType[];
  settings: DefaultSettings;
};

export const ColumnChart = ({ width, height, data, scale, palette, sprintList, settings }: BarChartProps) => {
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
  const [xMin, xMax] = d3.extent(data, (d) => new Date(d.date).getTime());
  const xScale = useMemo(() => {
    return d3.scaleBand<string>().domain(alLUsers).range([0, boundsWidth]).padding(0.1);
  }, [boundsWidth, xMax, xMin]);

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
          const x0 = xScale(u);
          const x1 = x0 + xScale.bandwidth();
          return x1 >= extent[0] && x0 <= extent[1];
        });
        if (selectedUsers.length) {
          xScale.domain(selectedUsers);
        }
      }

      svgElement.select('.brush').call(brush.move, null);

      svgElement.select('.xAxis').transition().duration(1000).call(d3.axisBottom(xScale));

      //svgElement.select('.xAxis').transition().duration(1000).call(d3.axisBottom(xTime));

      updateBars(
        palette,
        data.filter((d) => xScale.domain().includes(d.user)),
        xScale,
        yScale,
        svgRef,
      );
      updateSprintAreas(sprintList, xScale, yScale, scale[0], scale[1], svgRef);
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
    if (settings.showSprints) {
      generateSprintAreas(sprintList, xScale, yScale, scale[0], scale[1], svgRef);
    }
  }, [xScale, yScale, boundsHeight, settings.showSprints]);

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
  data: { user: string; value: number }[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
  tooltipRef: MutableRefObject<null>,
) {
  const svg = d3.select(svgRef.current);

  svg
    .selectAll('.bar')
    .data(data, (d) => d.user)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => x(d.user)!)
    .attr('y', (d) => y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', (d) => y(0) - y(d.value))
    .attr('fill', (d) => palette[d.user].main)
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
}

function updateBars(
  palette: Palette,
  data: { user: string; value: number }[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
) {
  const svg = d3.select(svgRef.current);

  svg
    .selectAll<SVGRectElement, { user: string; value: number }>('.bar')
    .data(data, (d) => d.user)
    .join(
      (enter) =>
        enter
          .append('rect')
          .attr('class', 'bar')
          .attr('x', (d) => x(d.user)!)
          .attr('y', (d) => y(d.value))
          .attr('width', x.bandwidth())
          .attr('height', 0)
          .attr('fill', (d) => palette[d.user].main)
          .transition()
          .attr('y', (d) => y(d.value))
          .attr('height', (d) => y(0) - y(d.value)),
      (update) =>
        update
          .transition()
          .attr('x', (d) => x(d.user)!)
          .attr('y', (d) => y(d.value))
          .attr('height', (d) => y(0) - y(d.value)),
      (exit) => exit.transition().attr('height', 0).attr('y', y(0)).remove(),
    );
}

function generateSprintAreas(
  sprints: SprintType[],
  xScale: ScaleBand<number>,
  yScale: ScaleLinear<number, number, never>,
  yMax: number,
  yMin: number,
  svgRef: React.MutableRefObject<null>,
) {
  const svgElement = d3.select(svgRef.current);
  svgElement
    .append('defs')
    .append('pattern')
    .attr('id', 'diagonalHatch')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 8)
    .attr('height', 8)
    .append('path')
    .attr('d', 'M-1,1 l2,-2 M0,8 l8,-8 M3,5 l2,-2')
    .attr('stroke', '#ff3b30')
    .attr('stroke-width', 1);

  sprints.forEach((sprint) => {
    svgElement
      .append('rect')
      .attr('id', `sprintStartLine${sprint.id}`)
      .attr('y', yScale(yMin))
      .attr('x', xScale(new Date(sprint.startDate)))
      .attr('height', yScale(yMax) - yScale(yMin))
      .attr('width', 1)
      .attr('fill', '#4cd964');
    svgElement
      .append('path')
      .attr('id', `sprintStartLineTriangle${sprint.id}`)
      .attr('d', symbol().type(symbolTriangle))
      .attr('width', '10')
      .attr('height', '10')
      .attr('transform', 'translate(' + (xScale(new Date(sprint.startDate)) + 4) + ',' + (yScale(yMin) + 5) + ') rotate(90)')
      .style('fill', '#4cd964');
    svgElement
      .append('rect')
      .attr('id', `sprintEndLine${sprint.id}`)
      .attr('y', yScale(yMin))
      .attr('x', xScale(new Date(sprint.endDate)))
      .attr('height', yScale(yMax) - yScale(yMin))
      .attr('width', 1)
      .attr('fill', '#ff3b30');
    svgElement
      .append('path')
      .attr('id', `sprintEndLineTriangle${sprint.id}`)
      .attr('d', symbol().type(symbolTriangle))
      .attr('width', '10')
      .attr('height', '10')
      .attr('transform', 'translate(' + (xScale(new Date(sprint.endDate)) - 3) + ',' + (yScale(yMin) + 5) + ') rotate(-90)')
      .style('fill', '#ff3b30');

    svgElement
      .append('rect')
      .attr('id', `sprintBackground${sprint.id}`)
      .attr('y', yScale(0) - 15)
      .attr('x', xScale(new Date(sprint.startDate)))
      .attr('height', 15)
      .attr('width', xScale(new Date(sprint.endDate)) - xScale(new Date(sprint.startDate)))
      .attr('fill', 'white');
    svgElement
      .append('rect')
      .attr('id', `sprintBackgroundStripes${sprint.id}`)
      .attr('y', yScale(0) - 15)
      .attr('x', xScale(new Date(sprint.startDate)))
      .attr('height', 15)
      .attr('width', xScale(new Date(sprint.endDate)) - xScale(new Date(sprint.startDate)))
      .attr('fill', 'url(#diagonalHatch)')
      .attr('stroke', '#ff3b30');
    svgElement
      .append('text')
      .attr('id', `sprintText${sprint.id}`)
      .attr('y', yScale(0) - 4)
      .attr('x', xScale(new Date(sprint.startDate)) + 2)
      .attr('height', 10)
      .attr('font-size', '.75rem')
      .attr('paint-order', 'stroke')
      .attr('stroke', 'white')
      .attr('stroke-width', '4px')
      .text(sprint.name);
  });
}

function updateSprintAreas(
  sprints: SprintType[],
  xScale: ScaleBand<number>,
  yScale: ScaleLinear<number, number, never>,
  yMax: number,
  yMin: number,
  svgRef: React.MutableRefObject<null>,
) {
  const svgElement = d3.select(svgRef.current);
  sprints.forEach((sprint) => {
    svgElement
      .select(`#sprintStartLine${sprint.id}`)
      .attr('y', yScale(yMin))
      .attr('x', xScale(new Date(sprint.startDate)))
      .attr('height', yScale(yMax) - yScale(yMin))
      .attr('width', 1);

    svgElement
      .select(`#sprintStartLineTriangle${sprint.id}`)
      .attr('width', '10')
      .attr('height', '10')
      .attr('transform', 'translate(' + (xScale(new Date(sprint.startDate)) + 4) + ',' + (yScale(yMin) + 5) + ') rotate(90)');

    svgElement
      .select(`#sprintEndLine${sprint.id}`)
      .attr('y', yScale(yMin))
      .attr('x', xScale(new Date(sprint.endDate)))
      .attr('height', yScale(yMax) - yScale(yMin))
      .attr('width', 1);

    svgElement
      .select(`#sprintEndLineTriangle${sprint.id}`)
      .attr('width', '10')
      .attr('height', '10')
      .attr('transform', 'translate(' + (xScale(new Date(sprint.endDate)) - 3) + ',' + (yScale(yMin) + 5) + ') rotate(-90)');

    svgElement
      .select(`#sprintBackground${sprint.id}`)
      .attr('y', yScale(0) - 15)
      .attr('x', xScale(new Date(sprint.startDate)))
      .attr('height', 15)
      .attr('width', xScale(new Date(sprint.endDate)) - xScale(new Date(sprint.startDate)));

    svgElement
      .select(`#sprintBackgroundStripes${sprint.id}`)
      .attr('y', yScale(0) - 15)
      .attr('x', xScale(new Date(sprint.startDate)))
      .attr('height', 15)
      .attr('width', xScale(new Date(sprint.endDate)) - xScale(new Date(sprint.startDate)));

    svgElement
      .select(`#sprintText${sprint.id}`)
      .attr('y', yScale(0) - 4)
      .attr('x', xScale(new Date(sprint.startDate)) + 2)
      .attr('height', 10);
  });
}

function getClosestIndex(x: number, data: ChartData[], xScale: ScaleTime<number, number, never>) {
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
