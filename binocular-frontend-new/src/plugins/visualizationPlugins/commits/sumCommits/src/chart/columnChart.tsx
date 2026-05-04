import columnChartStyles from './columnChart.module.scss';
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SumSettings } from '../settings/settings';

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export interface Palette {
  [signature: string]: { main: string; secondary: string };
}

type ColumnChartProps = {
  width: number;
  height: number;
  data: ColumnChartData[];
  scale: number[];
  palette: Palette;
  settings: SumSettings;
};

interface InfoState {
  label: string;
  value: number;
  avgCommitsPerWeek: number;
  segments?: { label: string; gitSignature: string; value: number }[];
}

export interface ColumnChartData {
  user: string;
  gitSignature: string;
  value: number;
  avgCommitsPerWeek: number;
}

export const ColumnChart = ({ width, height, data, scale, palette, settings }: ColumnChartProps) => {
  // bounds = area inside the graph axis = ccalculated by substracting the margins
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [info, setInfo] = useState<null | InfoState>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const MAX_CHARS = 15;
  const [yDomain, setYDomain] = useState<[number, number] | null>(null);

  //Create array with users that are visible on zoom, otherwise when opening the infobox it zooms out
  const [visibleUsers, setVisibleUsers] = useState<string[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const allUsers = useMemo(() => data.map((d) => d.user), [data]);

  //Create userdata for the infobox (sum/diff commits)
  const [compareUser, setCompareUser] = useState<string>('');
  const [sumUsers, setSumUsers] = useState<string[]>([]);
  const [userToAdd, setUserToAdd] = useState<string>('');

  const diffCommits = useMemo(() => {
    if (!info || !compareUser) return null;

    const baseUser = data.find((d) => d.user === info.label);
    const compareUserData = data.find((d) => d.user === compareUser);

    if (!baseUser || !compareUserData) return null;

    return baseUser.value - compareUserData.value;
  }, [info, compareUser, data]);

  const sumCommits = useMemo(() => {
    return sumUsers.reduce((acc, u) => {
      const d = data.find((d) => d.user === u);
      return acc + (d ? d.value : 0);
    }, info?.value ?? 0);
  }, [sumUsers, info, data]);

  const ellipsis = (label: string) => (label.length > MAX_CHARS ? label.slice(0, MAX_CHARS - 1) + '…' : label);

  //This is needed to make sure that the chart stays zoomed in when clicking on a user for the infobox
  useEffect(() => {
    if (!isZoomed) setVisibleUsers(allUsers);
  }, [allUsers, isZoomed]);

  // Y axis
  const yScale = useMemo(() => {
    const max = scale[1] ?? 0;
    const paddedMax = max === 0 ? 1 : max * 1.1;
    const domain = yDomain ?? [0, paddedMax || 1];

    return d3.scaleLinear().domain(domain).nice().range([boundsHeight, 0]);
  }, [boundsHeight, scale, yDomain]);

  // X axis
  const xScale = useMemo(() => {
    return d3.scaleBand<string>().domain(visibleUsers).range([0, boundsWidth]).paddingInner(0.01).paddingOuter(0.05);
  }, [visibleUsers, boundsWidth]);

  let idleTimeout: number | null = null;
  function idled() {
    idleTimeout = null;
  }

  //Listener for the infobox to close when the user clicks outside of it
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

  const brush = d3
    .brush()
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
        setIsZoomed(false);
        setVisibleUsers(allUsers);
        setYDomain(null);
      } else {
        const [[x0, y0], [x1, y1]] = extent;
        const selectedUsers = allUsers.filter((u) => {
          const bandX = xScale(u);
          if (bandX === null || bandX === undefined) {
            return false;
          }

          const bandStart = bandX;
          const bandEnd = bandX + xScale.bandwidth();
          return bandEnd >= x0 && bandStart <= x1;
        });

        const newYMax = yScale.invert(y0);
        const newYMin = yScale.invert(y1);

        setIsZoomed(true);
        if (selectedUsers.length) {
          setVisibleUsers(selectedUsers);
        }
        setYDomain([newYMin, newYMax]);
        setIsZoomed(true);
      }

      //Needed to fix the brush being called endlessly leading to a stack overflow
      if (extent) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        svgElement.select('.brush').call(brush.move, null);
      }
      // d3/typescript sometimes does weird things and throws an error where no error is.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error

      svgElement.select('.xAxis').transition().duration(1000).call(d3.axisBottom(xScale).tickFormat(ellipsis));

      svgElement
        .select('.yAxis')
        .transition()
        .duration(1000)
        // d3/typescript sometimes does weird things and throws an error where no error is.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format('d')));

      if (settings.showMean) {
        svgElement.selectAll('.meanLine').remove();
        generateMeanLine(data, boundsWidth, yScale, svgRef);
      }
      updateBars(
        palette,
        data.filter((d) => xScale.domain().includes(d.user)),
        xScale,
        yScale,
        svgRef,
        tooltipRef,
        setInfo,
      );
    });

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .append('g')
      .attr('class', 'xAxis')
      .attr('transform', `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(ellipsis))
      .selectAll('text')
      .append('title')
      .style('font-size', '10px')
      .style('text-anchor', 'middle');

    svg
      .append('g')
      .attr('class', 'yAxis')
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format('d')));

    svg.append('g').attr('class', 'brush').call(brush);

    generateBars(
      palette,
      data.filter((d) => xScale.domain().includes(d.user)),
      xScale,
      yScale,
      svgRef,
      tooltipRef,
      setInfo,
    );

    if (settings.showMean) {
      generateMeanLine(data, boundsWidth, yScale, svgRef);
    }
  }, [xScale, yScale, boundsHeight, settings.showMean, scale, palette, data, boundsWidth]);

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
          zIndex: +1,
        }}>
        Tooltip
      </div>

      <div style={{ position: 'relative', width, height }}>
        <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
          <g width={boundsWidth} height={boundsHeight} ref={svgRef} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}></g>
        </svg>

        {info && (
          <div ref={infoRef} onClick={() => setInfo(null)}>
            <div onClick={(e) => e.stopPropagation()} className={columnChartStyles.infoBox}>
              <button aria-label="Close" onClick={() => setInfo(null)} className="btn btn-sm btn-ghost absolute right-0.5 top-0.5">
                <strong>X</strong>
              </button>

              <h3 className={columnChartStyles.infoBoxHeader}>{info.label}</h3>
              <p>
                <span className={columnChartStyles.infoBoxLabel}>Sum Commits: </span>
                <span className={columnChartStyles.infoBoxValue}>{info.value}</span>
              </p>
              <p>
                <span className={columnChartStyles.infoBoxLabel}>Avg Commits per week: </span>
                <span className={columnChartStyles.infoBoxValue}>{info.avgCommitsPerWeek} </span>
              </p>

              <div className={columnChartStyles.infoRow}>
                <span className={columnChartStyles.infoBoxLabel}> Diff&nbsp;to:</span>
                <select className={columnChartStyles.selectBox} value={compareUser} onChange={(e) => setCompareUser(e.target.value)}>
                  <option value={''} className={columnChartStyles.infoBoxValue}>
                    Pick user...
                  </option>
                  {allUsers
                    .filter((u) => u !== info.label)
                    .map((u) => (
                      <option key={u} value={u} className={columnChartStyles.infoBoxValue}>
                        {u}
                      </option>
                    ))}
                </select>
              </div>

              {diffCommits !== null && (
                <span>
                  <strong className={columnChartStyles.infoBoxValue}>{diffCommits} Commits</strong>
                </span>
              )}

              <div className={columnChartStyles.infoRow}>
                <span className={columnChartStyles.infoBoxLabel}>Sum with</span>
                <div className={columnChartStyles.combineUsersBlock}>
                  <select className={columnChartStyles.selectBox} value={userToAdd} onChange={(e) => setUserToAdd(e.target.value)}>
                    <option value={''} disabled>
                      Pick user...
                    </option>
                    {allUsers
                      .filter((u) => u !== info.label && !sumUsers.includes(u))
                      .map((u) => (
                        <option key={u} value={u} className={columnChartStyles.userName}>
                          {u}
                        </option>
                      ))}
                  </select>
                  <button
                    className={columnChartStyles.addButton}
                    onClick={() => {
                      if (userToAdd && !sumUsers.includes(userToAdd)) {
                        setSumUsers((prev) => [...prev, userToAdd]);
                        setUserToAdd('');
                      }
                    }}>
                    +
                  </button>
                </div>
              </div>

              {sumUsers.length > 0 && (
                <div>
                  <p>
                    <strong className={columnChartStyles.infoBoxValue}>{sumCommits} Commits</strong>
                  </p>
                  <span className={columnChartStyles.infoBoxLabel}>Remove user from sum:</span>
                  <div className={columnChartStyles.userChips}>
                    {sumUsers.map((u) => (
                      <span key={u} className={columnChartStyles.userChip}>
                        <span className={columnChartStyles.userName}>{u}</span>
                        <button
                          className={columnChartStyles.chipClose}
                          onClick={() => {
                            setSumUsers((prev) => prev.filter((user) => user !== u));
                          }}>
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function generateBars(
  palette: Palette,
  data: {
    user: string;
    gitSignature: string;
    value: number;
    avgCommitsPerWeek: number;
    segments?: { label: string; gitSignature: string; value: number }[];
  }[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
  tooltipRef: MutableRefObject<null>,
  setInfo: React.Dispatch<React.SetStateAction<null | InfoState>> = () => {},
) {
  const svg = d3.select(svgRef.current);
  const barWidth = x.bandwidth() / 2;
  const barOffset = x.bandwidth() / 4;
  const xBar = y(y.domain()[0]);

  const bars = svg
    .selectAll('.bar.main')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar main')
    .attr('x', (d) => x(d.user)! + barOffset)
    .attr('width', barWidth)
    .attr('y', xBar)
    .attr('height', 0)
    .attr('fill', (d) => palette[d.gitSignature]?.main)
    .on('mouseover', () => d3.select(tooltipRef.current).style('visibility', 'visible'))
    .on('mousemove', (e, d) =>
      d3
        .select(tooltipRef.current)
        .style('top', 20 + e.pageY + 'px')
        .style('left', e.pageX + 'px')
        .style('background', palette[d.gitSignature]?.secondary)
        .style('border-color', palette[d.gitSignature]?.secondary)
        .text(`${d.gitSignature}: ${d.value} Commits`),
    )
    .on('mouseout', () => d3.select(tooltipRef.current).style('visibility', 'hidden'))
    .on('mousedown', (e) => e.stopPropagation())
    .on('click', (e, d) => {
      e.stopPropagation();
      setInfo({
        label: d.user,
        value: d.value,
        segments: d.segments,
        avgCommitsPerWeek: d.avgCommitsPerWeek,
      });
    });
  bars
    .filter((d) => (d.segments?.length ?? 0) > 0)
    .each(function (d) {
      const xPos = x(d.user)! + barOffset;
      let yPos = 0;
      d.segments?.forEach((seg) => {
        const h = y(0) - y(seg.value);
        svg
          .append('rect')
          .attr('class', 'bar segment')
          .attr('x', xPos)
          .attr('y', y(0))
          .attr('width', barWidth)
          .attr('height', 0)
          .attr('fill', palette[seg.gitSignature]?.main)
          .on('mousedown', (e) => e.stopPropagation())
          .on('mouseover', () => d3.select(tooltipRef.current).style('visibility', 'visible'))
          .on('click', (e) => {
            e.stopPropagation();
            setInfo({
              label: d.user,
              value: d.value,
              segments: d.segments,
              avgCommitsPerWeek: d.avgCommitsPerWeek,
            });
          })
          .on('mousemove', (e) =>
            d3
              .select(tooltipRef.current)
              .style('top', 20 + e.pageY + 'px')
              .style('left', e.pageX + 'px')
              .style('background', palette[seg.gitSignature]?.secondary)
              .style('border-color', palette[seg.gitSignature]?.secondary)
              .text(`${d.user}: ${d.value} Commits`),
          )
          .on('mouseout', () => d3.select(tooltipRef.current).style('visibility', 'hidden'))
          .transition()
          .duration(600)
          .attr('y', y(seg.value + yPos))
          .attr('height', h);
        yPos += seg.value;
      });
    });

  bars
    .transition()
    .duration(600)
    .attr('y', (d) => y(d.value))
    .attr('height', (d) => Math.max(0, xBar - y(d.value)));
}

function updateBars(
  palette: Palette,
  data: {
    user: string;
    gitSignature: string;
    value: number;
    avgCommitsPerWeek: number;
    segments?: { label: string; gitSignature: string; value: number }[];
  }[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
  tooltipRef: MutableRefObject<null>,
  setInfo: React.Dispatch<React.SetStateAction<null | InfoState>> = () => {},
) {
  const svg = d3.select(svgRef.current);
  const barWidth = x.bandwidth() / 2;
  const barOffset = x.bandwidth() / 4;
  const xBar = y(y.domain()[0]);

  const zoomedBars = svg
    .selectAll<SVGRectElement, ColumnChartData>('.bar.main')
    .data(data, (d) => d.user)
    .join(
      (enter) =>
        enter
          .append('rect')
          .attr('class', 'bar main')
          .attr('x', (d) => x(d.user)! + barOffset)
          .attr('y', xBar)
          .attr('width', barWidth)
          .attr('height', 0)
          .attr('fill', (d) => palette[d.gitSignature]?.main)
          .transition()
          .duration(600)
          .attr('y', (d) => y(d.value))
          .attr('height', (d) => Math.max(0, xBar - y(d.value))),

      (update) =>
        update
          .transition()
          .duration(600)
          .attr('x', (d) => x(d.user)! + barOffset)
          .attr('y', (d) => y(d.value))
          .attr('width', barWidth)
          .attr('height', (d) => Math.max(0, xBar - y(d.value))),

      (exit) => exit.transition().duration(200).attr('y', xBar).attr('height', 0).remove(),
    );

  zoomedBars
    .on('mouseover', () => d3.select(tooltipRef.current).style('visibility', 'visible'))
    .on('mousemove', (e, d) =>
      d3
        .select(tooltipRef.current)
        .style('top', 20 + e.pageY + 'px')
        .style('left', e.pageX + 'px')
        .style('background', palette[d.gitSignature]?.secondary)
        .style('border-color', palette[d.gitSignature]?.secondary)
        .text(`${d.user}: ${d.value} Commits`),
    )
    .on('mouseout', () => d3.select(tooltipRef.current).style('visibility', 'hidden'))
    .on('mousedown', (e) => e.stopPropagation())
    .on('click', (e, d) => {
      e.stopPropagation();
      setInfo({
        label: d.user,
        value: d.value,
        segments: d.segments,
        avgCommitsPerWeek: d.avgCommitsPerWeek,
      });
    });
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
