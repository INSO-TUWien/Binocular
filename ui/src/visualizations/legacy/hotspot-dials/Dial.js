import * as d3 from 'd3';
import ClockScale from './ClockScale.js';
import ClosingPathContext from '../../../utils/ClosingPathContext.js';

import styles from './styles.scss';

const MAXIMUM_FILL_RATE = 0.9;

export default function Dial(props) {
  if (props.maximum === 0 || props.categories.length === 0) {
    return <circle r={props.radius} cx="0" cy="0" />;
  }

  const scale = d3.scaleLinear().domain([0, props.maximum]).range([props.minimumFillRate, MAXIMUM_FILL_RATE]);

  const clock = new ClockScale(0, 0, props.radius);

  const dataPoints = [];
  const slices = [];

  const points = props.categories.map(cat => {
    const coords = clock.getCoordsForShare((cat.category - 1) / props.categories.length, scale(cat.count));

    const textCoords = clock.getCoordsForShare((cat.category - 1) / props.categories.length, props.minimumFillRate * 1.25);

    dataPoints.push(
      <g key={`dataPoint-${cat.category}`}>
        <circle r="3" cx={coords.x} cy={coords.y} />
        <text x={textCoords.x} y={textCoords.y}>
          {cat.count}
        </text>
      </g>
    );

    return coords;
  });

  const curvePath = new ClosingPathContext();
  curvePath.smoothCurve(points, { smoothness: 0.5, close: true });

  const tickMarks = props.categories.map((cat, i) => {
    const textShare = i / props.categories.length;
    const tickShare = textShare - 1 / (2 * props.categories.length);

    const textCoords = clock.getCoordsForShare(textShare, 1.05);
    const insetCoords = clock.getCoordsForShare(tickShare, props.minimumFillRate);
    const faceCoords = clock.getCoordsForShare(tickShare);

    const slice = new ClosingPathContext();
    slice.moveTo(0, 0);
    const topLeft = clock.getCoordsForShare(tickShare, 2);
    const topRight = clock.getCoordsForShare(tickShare + 1 / props.categories.length, 1.1);
    slice.lineTo(topLeft.x, topLeft.y);
    slice.lineTo(topRight.x, topRight.y);
    slice.lineTo(0, 0);
    slices.push(slice);

    return (
      <g key={`tickMark-${cat.category}`}>
        <line x1={faceCoords.x} y1={faceCoords.y} x2={insetCoords.x} y2={insetCoords.y} />
        {props.showLabels &&
          <text x={textCoords.x} y={textCoords.y}>
            {cat.label}
          </text>}
      </g>
    );
  });

  const curveMaskId = `curve-${props.id}`;
  const clockMaskId = `clock-${props.id}`;

  const segments = slices.map((s, i) => {
    return (
      <path key={`segment-${i}`} d={s} className={styles.segment} style={{ fill: props.palette[i] }} clipPath={`url(#${curveMaskId})`} />
    );
  });

  return (
    <g className={props.className}>
      <defs>
        <clipPath id={clockMaskId}>
          <circle r={props.radius} cx="0" cy="0" opacity="0.5" />
        </clipPath>
        <clipPath id={curveMaskId}>
          <path d={curvePath} className={styles.curve} />
        </clipPath>
      </defs>
      <circle className={styles.outer} r={props.radius} cx="0" cy="0" />
      <g className={styles.ticks}>
        {tickMarks}
        {segments}
        <path d={curvePath} className={styles.curve} />
        {dataPoints}
      </g>
      <circle r={props.radius * props.minimumFillRate} cx="0" cy="0" className={styles.spacer} />
    </g>
  );
}
