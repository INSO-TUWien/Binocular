import columnChartStyles from './columnChart.module.scss';
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
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

interface InfoState {
  label: string;
  value: number;
  avgCommitsPerWeek: number;
  segments?: { label: string; value: number }[];
}

export const ColumnChart = ({ width, height, data, scale, palette, settings }: BarChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [info, setInfo] = useState<null | InfoState>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

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

  //This is needed to make sure that the chart stays zoomed in when clicking on a user for the infobox
  useEffect(() => {
    if (!isZoomed) setVisibleUsers(allUsers);
  }, [allUsers, isZoomed]);

  // Y axis
  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([scale[0], scale[1]]).range([boundsHeight, 0]);
  }, [boundsHeight, scale]);

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [info]);

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
        setIsZoomed(false);
        setVisibleUsers(allUsers);
      } else {
        const selectedUsers = allUsers.filter((u) => {
          const x0 = xScale(u)!;
          const x1 = x0 + xScale.bandwidth();
          return x1 >= extent[0] && x0 <= extent[1];
        });
        setIsZoomed(true);
        if (selectedUsers.length) {
          setVisibleUsers(selectedUsers);
        }
      }

      //Needed to fix the brush being called endlessly leading to a stack overflow
      if (extent) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/unbound-method
        svgElement.select('.brush').call(brush.move, null);
      }
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
        tooltipRef,
        setInfo,
      );

      if (settings.showMean) {
        svgElement.selectAll('.meanLine').remove();
        generateMeanLine(data, boundsWidth, yScale, svgRef);
      }
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
  }, [xScale, yScale, boundsHeight, settings.showMean, scale, brush, palette, data, boundsWidth]);

  return (
    <>
      <div style={{ position: 'relative', width, height }}>
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            visibility: 'hidden',
            border: '2px solid',
            padding: '.2rem',
            borderRadius: '4px',
            fontSize: '.75rem',
          }}>
          Tooltipp
        </div>
        <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
          <g width={boundsWidth} height={boundsHeight} ref={svgRef} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}></g>
        </svg>

        {info && (
          <div ref={infoRef} onClick={() => setInfo(null)}>
            <div onClick={(e) => e.stopPropagation()} className={columnChartStyles.infoBox}>
              <h3 className={columnChartStyles.infoBoxHeader}>{info.label}</h3>
              <p>Sum Commits: {info.value}</p>
              <p>Avg Commits per week: {info.avgCommitsPerWeek}</p>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Diff&nbsp;to:
                <select value={compareUser} onChange={(e) => setCompareUser(e.target.value)}>
                  {allUsers
                    .filter((u) => u !== info.label)
                    .map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                </select>
              </label>

              {diffCommits !== null && (
                <span>
                  <strong>{diffCommits}</strong>
                </span>
              )}

              <div>
                <span>Sum with user:</span>
                <select value={userToAdd} onChange={(e) => setUserToAdd(e.target.value)}>
                  <option value={''} disabled>
                    Pick user...
                  </option>
                  {allUsers
                    .filter((u) => u !== info.label && !sumUsers.includes(u))
                    .map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                </select>

                <button
                  onClick={() => {
                    if (userToAdd && !sumUsers.includes(userToAdd)) {
                      setSumUsers((prev) => [...prev, userToAdd]);
                      setUserToAdd('');
                    }
                  }}>
                  <strong>+</strong>
                </button>

                {sumUsers.length > 0 && (
                  <p>
                    <strong>{sumCommits}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function generateBars(
  palette: Palette,
  data: { user: string; value: number; avgCommitsPerWeek: number; segments?: { label: string; value: number }[] }[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
  tooltipRef: MutableRefObject<null>,
  setInfo: React.Dispatch<React.SetStateAction<null | InfoState>> = () => {},
) {
  const svg = d3.select(svgRef.current);
  const barWidth = x.bandwidth() / 2;
  const barOffset = x.bandwidth() / 4;

  svg.selectAll('.bar').remove();

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
    .on('mousedown', (e) => e.stopPropagation())
    .on('click', (e, d) => {
      e.stopPropagation();
      setInfo({
        label: d.user,
        value: d.value,
        segments: d.segments,
        avgCommitsPerWeek: d.avgCommitsPerWeek,
      });
    })
    .filter((d) => (d.segments?.length ?? 0) > 0)
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
              .style('background', palette[seg.label].secondary)
              .style('border-color', palette[seg.label].secondary)
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
  data: { user: string; value: number; avgCommitsPerWeek: number; segments?: { label: string; value: number }[] }[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  svgRef: MutableRefObject<null>,
  tooltipRef: MutableRefObject<null>,
  setInfo: React.Dispatch<React.SetStateAction<null | InfoState>> = () => {},
) {
  const svg = d3.select(svgRef.current);
  svg.selectAll('.bar').remove();

  generateBars(palette, data, x, y, svgRef, tooltipRef, setInfo);
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
