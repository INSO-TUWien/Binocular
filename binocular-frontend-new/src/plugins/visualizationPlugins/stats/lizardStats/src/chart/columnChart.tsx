import columnChartStyles from './columnChart.module.scss';
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { LizardSettings } from '../settings/settings';

const MARGIN = { top: 30, right: 30, bottom: 90, left: 70 };

export interface Palette {
  [key: string]: { main: string; secondary: string };
}

type ColumnChartProps = {
  width: number;
  height: number;
  data: ColumnChartData[];
  scale: number[];
  palette: Palette;
  settings: LizardSettings;
};

interface InfoState extends ColumnChartData {}

export interface ColumnChartData {
  filePath: string;
  label: string;
  value: number;

  maxNloc: number;
  maxCcn: number;
  maxTokens: number;
  maxParameters: number;
  maxLength: number;

  avgNloc: number;
  avgCcn: number;
  avgTokens: number;
  avgParameters: number;
  avgLength: number;

  functionCount: number;

  maxLizardScore: number;
  avgLizardScore: number;
  normalizedMaxLizardScore: number;
  normalizedAvgLizardScore: number;
}

export const ColumnChart = ({ width, height, data, scale }: ColumnChartProps) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const infoRef = useRef<HTMLDivElement | null>(null);
  const [info, setInfo] = useState<null | InfoState>(null);

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const allFiles = useMemo(() => data.map((d) => d.label), [data]);
  const maxChars = allFiles.length > 10 ? 10 : 15;

  const ellipsis = (label: string) => (label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label);

  const yScale = useMemo(() => {
    const max = scale[1] ?? 0;
    const paddedMax = max === 0 ? 1 : max * 1.1;

    return d3.scaleLinear().domain([0, paddedMax]).nice().range([boundsHeight, 0]);
  }, [boundsHeight, scale]);

  const xScale = useMemo(() => {
    return d3.scaleBand<string>().domain(allFiles).range([0, boundsWidth]).paddingInner(0.1).paddingOuter(0.05);
  }, [allFiles, boundsWidth]);

  useEffect(() => {
    if (!info) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfo(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [info]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .append('g')
      .attr('class', 'xAxis')
      .attr('transform', `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(ellipsis))
      .selectAll('text')
      .style('font-size', '10px')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-35)')
      .attr('dx', '-0.4em')
      .attr('dy', '0.6em')
      .append('title')
      .text((d) => String(d));

    svg.append('g').attr('class', 'yAxis').call(d3.axisLeft(yScale).ticks(6));

    svg
      .append('text')
      .attr('x', -boundsHeight / 2)
      .attr('y', -50)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-base-content)')
      .style('font-weight', '600')
      .text('Lizard Score');

    svg
      .append('text')
      .attr('x', boundsWidth / 2)
      .attr('y', boundsHeight + 75)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-base-content)')
      .style('font-weight', '600')
      .text('Files');

    generateBars(data, xScale, yScale, svgRef, tooltipRef, setInfo);
  }, [xScale, yScale, boundsHeight, boundsWidth, data]);

  return (
    <>
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          visibility: 'hidden',
          border: '2px solid',
          padding: '.2rem',
          borderRadius: '4px',
          fontSize: '.75rem',
          zIndex: 1,
        }}>
        Tooltip
      </div>

      <div style={{ position: 'relative', width, height }}>
        <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
          <g ref={svgRef} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}></g>
        </svg>

        {info && (
          <div ref={infoRef} onClick={() => setInfo(null)}>
            <div onClick={(e) => e.stopPropagation()} className={columnChartStyles.infoBox}>
              <button aria-label="Close" onClick={() => setInfo(null)} className="btn btn-sm btn-ghost absolute right-0.5 top-0.5">
                <strong>X</strong>
              </button>

              <h3 className={columnChartStyles.infoBoxHeader}>{info.filePath.substring(info.filePath.lastIndexOf('/') + 1)}</h3>

              <p>
                <span className={columnChartStyles.infoBoxLabel}>Displayed Score: </span>
                <span className={columnChartStyles.infoBoxValue}>{info.value.toFixed(2)}</span>
              </p>

              <p>
                <span className={columnChartStyles.infoBoxLabel}>Max Lizard Score: </span>
                <span className={columnChartStyles.infoBoxValue}>{info.maxLizardScore.toFixed(2)}</span>
              </p>

              <p>
                <span className={columnChartStyles.infoBoxLabel}>Avg Lizard Score: </span>
                <span className={columnChartStyles.infoBoxValue}>{info.avgLizardScore.toFixed(2)}</span>
              </p>

              <div className={columnChartStyles.infoBoxSpace} />

              <p><span className={columnChartStyles.infoBoxLabel}>Max NLOC: </span>{info.maxNloc}</p>
              <p><span className={columnChartStyles.infoBoxLabel}>Max CCN: </span>{info.maxCcn}</p>
              <p><span className={columnChartStyles.infoBoxLabel}>Max Tokens: </span>{info.maxTokens}</p>
              <p><span className={columnChartStyles.infoBoxLabel}>Max Parameters: </span>{info.maxParameters}</p>
              <p><span className={columnChartStyles.infoBoxLabel}>Max Length: </span>{info.maxLength}</p>

              <div className={columnChartStyles.infoBoxSpace} />

              <p><span className={columnChartStyles.infoBoxLabel}>Avg NLOC: </span>{info.avgNloc}</p>
              <p><span className={columnChartStyles.infoBoxLabel}>Avg CCN: </span>{info.avgCcn}</p>
              <p><span className={columnChartStyles.infoBoxLabel}>Avg Tokens: </span>{info.avgTokens}</p>
              <p><span className={columnChartStyles.infoBoxLabel}>Avg Parameters: </span>{info.avgParameters}</p>
              <p><span className={columnChartStyles.infoBoxLabel}>Avg Length: </span>{info.avgLength}</p>

              <div className={columnChartStyles.infoBoxSpace} />

              <p>
                <span className={columnChartStyles.infoBoxLabel}>Functions: </span>
                <span className={columnChartStyles.infoBoxValue}>{info.functionCount}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function styleTooltipText(tooltip: d3.Selection<null, unknown, null, undefined>) {
  return tooltip.style('background', 'var(--color-base-100)').style('color', 'var(--color-base-content)');
}

function generateBars(
  data: ColumnChartData[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
  tooltipRef: MutableRefObject<null>,
  setInfo: React.Dispatch<React.SetStateAction<null | InfoState>> = () => {},
) {
  const svg = d3.select(svgRef.current);
  const barWidth = x.bandwidth() / 2;
  const barOffset = x.bandwidth() / 4;
  const xBar = y(0);

  const bars = svg
    .selectAll('.bar.main')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar main')
    .attr('x', (d) => x(d.label)! + barOffset)
    .attr('width', barWidth)
    .attr('y', xBar)
    .attr('height', 0)
    .style('fill', 'var(--color-primary)')
    .on('mouseover', () => d3.select(tooltipRef.current).style('visibility', 'visible'))
    .on('mousemove', (e, d) => {
      const tooltip = d3
        .select(tooltipRef.current)
        .style('top', 20 + e.pageY + 'px')
        .style('left', e.pageX + 'px')
        .style('border-color', 'var(--color-primary)')
        .text(`${d.filePath}: ${d.value.toFixed(2)} Lizard Score`);

      styleTooltipText(tooltip);
    })
    .on('mouseout', () => d3.select(tooltipRef.current).style('visibility', 'hidden'))
    .on('mousedown', (e) => e.stopPropagation())
    .on('click', (e, d) => {
      e.stopPropagation();
      setInfo(d);
    });

  bars
    .transition()
    .duration(600)
    .attr('y', (d) => y(d.value))
    .attr('height', (d) => Math.max(0, xBar - y(d.value)));
}
