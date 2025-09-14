import * as React from 'react';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import * as d3 from 'd3';
import classes from './sprintChart.module.css';

const findMinMaxDate = (dates: Date[]) =>
  dates.reduce(
    (acc, cur) => {
      if (cur.valueOf() > acc.max.valueOf()) {
        acc.max = cur;
      }
      if (cur.valueOf() < acc.min.valueOf()) {
        acc.min = cur;
      }
      return acc;
    },
    { min: new Date(), max: new Date() },
  );

const maxOpenEvents = 60;

export const SprintChart: React.FC<{ data: DataPluginIssue[] }> = ({
  data,
}) => {
  const [{ width = 0, height = 0 } = {}, setDomRect] =
    React.useState<Partial<DOMRect>>();
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState(0);

  const svgChartRef = React.useRef<SVGSVGElement>(null);

  const mappedData = data.map((d) => ({
    ...d,
    createdAt: new Date(d.createdAt),
    closedAt: d.closedAt ? new Date(d.closedAt) : undefined,
  }));

  React.useEffect(() => {
    const { current: svg } = svgChartRef;
    if (!svg) {
      return;
    }

    setDomRect(svg.getBoundingClientRect() ?? {});

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setZoom(e.transform.k);
        setOffset(e.transform.y);
      });
    d3.select(svg).call(zoom);
  }, []);

  const { min: minDate, max: maxDate } = findMinMaxDate(
    mappedData
      .flatMap((d) => [d.createdAt, d.closedAt ? d.closedAt : undefined])
      .filter((d) => !!d),
  );

  const scale = d3
    .scaleUtc()
    .range([20, Math.abs(width - 20)])
    .domain([minDate, maxDate]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      ref={svgChartRef}
      width={'100%'}
      height={'100%'}
      viewBox={`0, 0, ${width}, ${height}`}
      className={classes.container}
    >
      {height > 0 &&
        width > 0 &&
        mappedData.map((d, i) => {
          const h = Math.max(0, ((height - 110) / maxOpenEvents - 2) * zoom);

          const x = scale(d.createdAt);
          const y =
            (30 + (i * height - 110) / maxOpenEvents - 2) * zoom + offset;

          return (
            <g key={d.iid}>
              <rect
                width={Math.max(
                  scale(d.closedAt ?? new Date()) - scale(d.createdAt) - 4,
                  h / maxOpenEvents - 2,
                  4,
                )}
                height={h}
                x={x}
                y={y}
                fill={'green'}
                strokeWidth={2}
                rx={'0.2rem'}
                stroke={'#FFF'}
              />
              <text
                x={x + 4}
                y={y + 20}
                width={Math.max(
                  scale(d.closedAt ?? new Date()) - scale(d.createdAt) - 4,
                  1,
                )}
                height={h}
                style={{ display: h > 25 ? undefined : 'none' }}
              >
                #{d.iid}
              </text>
            </g>
          );
        })}
    </svg>
  );
};
