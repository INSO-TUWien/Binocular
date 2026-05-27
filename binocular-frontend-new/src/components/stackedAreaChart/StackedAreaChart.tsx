import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SprintType } from '../../types/data/sprintType.ts';
import { round } from 'lodash';
import { SprintAreas } from '../sprintAreas/SprintAreas.tsx';
import {
  computeVisibleYDomain,
  getClosestIndex,
  getNonEmptyKeys,
  PositiveNegativeSide,
  positionTooltip,
  setTooltipContent,
  splitPositiveNegativeData,
  type TooltipSelection,
  updateAreaPaths,
} from './utils.ts';

export interface ChartData {
  date: number;
  [signature: string]: number;
}

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };
const TRANSITION_MS = 300;

type AreaChartProps = {
  width: number;
  height: number;
  data: ChartData[];
  scale: number[];
  palette: Palette;
  sprintList: SprintType[];
  settings: { visualizationStyle: string; showSprints: boolean };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d3offset?: (series: any, order: number[]) => void;
};

export const StackedAreaChart = ({ width, height, data, scale, palette, sprintList, settings, d3offset }: AreaChartProps) => {
  const svgRef = useRef<SVGGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const [yDomain, setYDomain] = useState<[number, number]>(scale.length >= 2 ? [scale[0], scale[1]] : [0, 1]);
  const [isManualYZoom, setIsManualYZoom] = useState(false);
  const yScale = useMemo(() => d3.scaleLinear().domain(yDomain).range([boundsHeight, 0]), [boundsHeight, yDomain]);

  const [xMin, xMax] = d3.extent(data, (d) => new Date(d.date).getTime());
  const [brushDomain, setBrushDomain] = useState<[number, number]>([xMin || 0, xMax || 0]);

  useEffect(() => {
    setBrushDomain([xMin || 0, xMax || 0]);
    setYDomain(scale.length >= 2 ? [scale[0], scale[1]] : [0, 1]);
    setIsManualYZoom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xMin, xMax]);

  useEffect(() => {
    if (!isManualYZoom) {
      setYDomain(computeVisibleYDomain(data, brushDomain, palette, d3offset));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brushDomain, data, isManualYZoom]);

  const xScale = useMemo(() => d3.scaleTime().domain(brushDomain).range([0, boundsWidth]), [boundsWidth, brushDomain]);

  // Stable refs so brush event handlers always access the latest scale values
  const xMinRef = useRef(xMin);
  const xMaxRef = useRef(xMax);
  const scaleRef = useRef(scale);
  const xScaleRef = useRef(xScale);
  const yScaleRef = useRef(yScale);
  useEffect(() => {
    xMinRef.current = xMin;
    xMaxRef.current = xMax;
    scaleRef.current = scale;
    xScaleRef.current = xScale;
    yScaleRef.current = yScale;
  });

  let idleTimeout: number | null = null;
  const idled = () => {
    idleTimeout = null;
  };

  const ctrlDragRef = useRef(false);

  const resetDomains = () => {
    setBrushDomain([xMinRef.current || 0, xMaxRef.current || 0]);
    setIsManualYZoom(false);
    setYDomain(scaleRef.current.length >= 2 ? [scaleRef.current[0], scaleRef.current[1]] : [0, 1]);
  };

  const brush = d3
    .brush()
    .filter((e) => !e.button)
    .extent([
      [0, 0],
      [boundsWidth, boundsHeight],
    ])
    .on('start', (e: d3.D3BrushEvent<unknown>) => {
      if (e.sourceEvent) ctrlDragRef.current = (e.sourceEvent as MouseEvent).ctrlKey ?? false;
    })
    .on('brush', (e: d3.D3BrushEvent<unknown>) => {
      if (!e.sourceEvent || !e.selection || ctrlDragRef.current) return;
      const [[x0], [x1]] = e.selection as [[number, number], [number, number]];
      d3.select(svgRef.current)
        .select<SVGGElement>('.brush')
        .call(brush.move, [
          [x0, 0],
          [x1, boundsHeight],
        ]);
    })
    .on('end', (e: d3.D3BrushEvent<unknown>) => {
      if (!e.sourceEvent) return;
      const selection = e.selection as [[number, number], [number, number]] | null;
      if (!selection) {
        if (!idleTimeout) return (idleTimeout = window.setTimeout(idled, 350));
        resetDomains();
        return;
      }
      const [[x0, y0], [x1, y1]] = selection;
      const wasCtrlDrag = ctrlDragRef.current;
      d3.select(svgRef.current).select<SVGGElement>('.brush').call(brush.move, null);
      setBrushDomain([xScaleRef.current.invert(x0).getTime(), xScaleRef.current.invert(x1).getTime()]);
      if (wasCtrlDrag) {
        setIsManualYZoom(true);
        setYDomain([yScaleRef.current.invert(y1), yScaleRef.current.invert(y0)]);
      }
    });

  const initDoneRef = useRef(false);
  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;
    const svg = d3.select(svgRef.current);
    svg.append('g').attr('class', 'yAxis');
    svg.append('g').attr('class', 'xAxis');
    svg.append('g').attr('class', 'areas');
    svg.append('g').attr('class', 'brush');
    svg.on('dblclick', resetDomains);
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg
      .select<SVGGElement>('.xAxis')
      .attr('transform', `translate(0,${boundsHeight})`)
      .transition()
      .duration(TRANSITION_MS)
      .ease(d3.easeCubicOut)
      .call(d3.axisBottom(xScale));

    svg
      .select('.xAxis')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-35)')
      .attr('dx', '-0.4em')
      .attr('dy', '0.6em');

    svg.select<SVGGElement>('.yAxis').transition().duration(TRANSITION_MS).ease(d3.easeCubicOut).call(d3.axisLeft(yScale));
    svg.select<SVGGElement>('.brush').call(brush);

    const allKeys = Object.keys(palette);
    const positiveData = splitPositiveNegativeData(data, PositiveNegativeSide.POSITIVE);
    const negativeData = splitPositiveNegativeData(data, PositiveNegativeSide.NEGATIVE);
    const positiveKeys = getNonEmptyKeys(allKeys, positiveData);
    const negativeKeys = getNonEmptyKeys(allKeys, negativeData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const positiveStack = d3.stack().keys(positiveKeys) as any;
    if (d3offset) positiveStack.offset(d3offset);
    const stackedPositiveData: d3.Series<ChartData, string>[] = positiveStack(positiveData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stackedNegativeData: d3.Series<ChartData, string>[] = (d3.stack().keys(negativeKeys) as any)(negativeData);

    updateAreaPaths(
      svg.select<SVGGElement>('.areas'),
      TRANSITION_MS,
      palette,
      data,
      settings.visualizationStyle,
      xScale,
      yScale,
      positiveKeys,
      negativeKeys,
      stackedPositiveData,
      stackedNegativeData,
    );

    // Tooltip fires via event bubbling even when the brush overlay intercepts pointer events
    svg.on('mousemove.tooltip', (e: MouseEvent) => {
      if (data.length === 0 || !svgRef.current) return;
      const [x, y] = d3.pointer(e);
      const closestIndex = getClosestIndex(x, data, xScale);
      const tooltip = d3.select(tooltipRef.current) as TooltipSelection;

      const allStacked = [
        { keys: positiveKeys, stacked: stackedPositiveData },
        { keys: negativeKeys, stacked: stackedNegativeData },
      ];
      for (const { keys, stacked } of allStacked) {
        for (let i = keys.length - 1; i >= 0; i--) {
          if (closestIndex >= stacked[i].length) continue;
          const px0 = yScale(stacked[i][closestIndex][0]);
          const px1 = yScale(stacked[i][closestIndex][1]);
          if (y >= Math.min(px0, px1) && y <= Math.max(px0, px1)) {
            const key = keys[i];
            tooltip.style('visibility', 'visible').style('border-color', palette[key].secondary);
            setTooltipContent(tooltip, key, `${round(data[closestIndex][key])}`);
            positionTooltip(tooltip, svgRef.current, e);
            return;
          }
        }
      }
      tooltip.style('visibility', 'hidden');
    });

    svg.on('mouseleave.tooltip', () => {
      d3.select(tooltipRef.current).style('visibility', 'hidden');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xScale, yScale, boundsHeight, data, palette, settings.visualizationStyle]);

  return (
    <>
      <div
        ref={tooltipRef}
        className={'card bg-base-100 shadow-xl rounded border-2 p-2 break-all'}
        style={{ position: 'fixed', visibility: 'hidden', minWidth: '10rem', maxWidth: '20rem' }}>
        <div className={'tooltip-label font-bold text-xs'}>Label</div>
        <div className={'tooltip-value badge badge-outline'}>Value</div>
      </div>
      <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
        <g width={boundsWidth} height={boundsHeight} ref={svgRef} transform={`translate(${MARGIN.left},${MARGIN.top})`} />
        {settings.showSprints && (
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            <SprintAreas sprints={sprintList} xScale={xScale} height={boundsHeight} bottomMargin={0} />
          </g>
        )}
      </svg>
    </>
  );
};
