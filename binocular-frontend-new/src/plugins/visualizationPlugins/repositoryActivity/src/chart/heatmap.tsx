import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { HeatmapProps } from '../utilities/types';

const createTooltip = () => {
  d3.select('body').selectAll('.d3-tooltip').remove();

  return d3
    .select('body')
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'absolute')
    .style('opacity', 0)
    .style('background-color', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('z-index', '1000');
};

function Heatmap({
  data,
  rowLabels,
  colLabels,
  minCellSize = 15,
  color = '#3182bd',
  cellPadding = 2,
  scaleHorizontal = false,
  scaleVertical = false,
  onCellClick = null,
  showLegend = true,
  legendTitle = 'Value',
  containerWidth = 0,
  containerHeight = 0,
}: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const legendRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);
  const [shouldShowLegend, setShouldShowLegend] = useState<boolean>(showLegend);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !rowLabels.length || !colLabels.length) return;

    const rows = rowLabels.length;
    const cols = colLabels.length;

    const margin = { top: 30, right: 10, bottom: 10, left: 40 };

    let cellWidth = minCellSize;
    let cellHeight = minCellSize;

    if (scaleHorizontal || scaleVertical) {
      console.log('containerWidth:', containerWidth, 'containerHeight:', containerHeight);

      if (scaleHorizontal) {
        const availableWidth = containerWidth - (margin.left + margin.right) * 1.5;
        cellWidth = Math.max(minCellSize, (availableWidth - (cols - 1) * cellPadding) / cols);
      }

      if (scaleVertical) {
        const availableHeight = containerHeight - margin.top - margin.bottom - (shouldShowLegend ? 50 : 0);
        cellHeight = Math.max(minCellSize, (availableHeight - (rows - 1) * cellPadding) / rows);
      }
      console.log('cellWidth:', cellWidth, 'cellHeight:', cellHeight);
    }

    const aWidth = cols * (cellWidth + cellPadding) + margin.left + margin.right;
    const aHeight = rows * (cellHeight + cellPadding) + margin.top + margin.bottom;
    // Check if there's enough space for legend
    if (containerRef.current && containerRef.current.clientHeight < aHeight) {
      setShouldShowLegend(false);
    } else {
      setShouldShowLegend(showLegend);
    }

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', aWidth)
      .attr('height', aHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    setMinValue(d3.min(data, (d) => d.value) || 0);
    const maxValue = d3.max(data, (d) => d.value) || 100;
    setMaxValue(maxValue);
    const opacityScale = d3.scaleLinear().domain([0, maxValue]).range([0.2, 1]);
    const tooltip = createTooltip();

    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('x', (d) => d.col * (cellWidth + cellPadding))
      .attr('y', (d) => d.row * (cellHeight + cellPadding))
      .attr('fill', color)
      .attr('fill-opacity', (d) => (d.value === 0 ? 0 : opacityScale(d.value)))
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('opacity', (d) => (d.value === 0 ? 0.1 : 1))
      .attr('stroke', (d) => (d.value === 0 ? '#333' : 'none'))
      .attr('stroke-width', (d) => (d.value === 0 ? 1 : 0))
      .style('cursor', onCellClick ? 'pointer' : 'default')
      .on('mouseover', function (event, d) {
        if (d.tooltip) {
          d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);

          tooltip
            .style('opacity', 1)
            .html(d.tooltip)
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
        }
      })
      .on('mousemove', function (event) {
        tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function (_event, d) {
        // Restore the original stroke based on value
        d3.select(this)
          .attr('stroke', d.value === 0 ? '#333' : 'none')
          .attr('stroke-width', d.value === 0 ? 1 : 0);
        tooltip.style('opacity', 0);
      })
      .on('click', function (_event, d) {
        if (onCellClick) onCellClick(d);
      });

    svg
      .selectAll('.row-label')
      .data(rowLabels)
      .enter()
      .append('text')
      .attr('x', -8)
      .attr('y', (_d, i) => i * (cellHeight + cellPadding) + cellHeight / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text((d) => d);

    svg
      .selectAll('.col-label')
      .data(colLabels)
      .enter()
      .append('text')
      .attr('x', (_d, i) => i * (cellWidth + cellPadding) + cellWidth / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text((d) => d);

    return () => {
      d3.select('body').selectAll('.d3-tooltip').remove();
    };
  }, [data, rowLabels, colLabels, minCellSize, color, cellPadding, onCellClick, showLegend, containerWidth, containerHeight]);

  useEffect(() => {
    if (!shouldShowLegend || !legendRef.current || !data || data.length === 0) return;

    d3.select(legendRef.current).selectAll('*').remove();

    const legendWidth = 200;
    const legendHeight = 8;
    const margin = { top: 20, right: 10, bottom: 15, left: 10 };

    const svg = d3
      .select(legendRef.current)
      .attr('width', legendWidth + margin.left + margin.right)
      .attr('height', legendHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient').attr('id', 'legend-gradient').attr('x1', '0%').attr('x2', '100%');

    linearGradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.1);

    linearGradient.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 1);

    svg
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('x', 0)
      .attr('y', 2)
      .style('fill', 'url(#legend-gradient)')
      .attr('rx', 2)
      .attr('ry', 2);

    svg
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '11px')
      .style('fill', '#666')
      .style('font-weight', '500')
      .text(legendTitle);

    svg
      .append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 11)
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(minValue);

    svg
      .append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 11)
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(maxValue);
  }, [data, color, shouldShowLegend, legendTitle, minValue, maxValue]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <svg ref={svgRef}></svg>
      {shouldShowLegend && <svg ref={legendRef}></svg>}
    </div>
  );
}

export default Heatmap;
