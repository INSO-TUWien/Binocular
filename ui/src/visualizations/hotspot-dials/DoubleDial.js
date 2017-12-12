import _ from 'lodash';
import * as d3 from 'd3';
import cx from 'classnames';

import ClockScale from './ClockScale.js';
import ClosingPathContext from '../../utils/ClosingPathContext.js';

import styles from './styles.scss';

const MAXIMUM_FILL_RATE = 0.9;

export default function Dial(props) {
  if (props.maximum === 0 || props.categories.length === 0) {
    return <circle r={props.radius} cx="0" cy="0" />;
  }

  const midShare = props.minimumFillRate + (MAXIMUM_FILL_RATE - props.minimumFillRate) * 0.5;
  const midRadius = props.radius * midShare;

  const scale = d3.scaleLinear().domain([0, props.maximum / 2]);

  const upperScale = scale.copy().range([midShare, MAXIMUM_FILL_RATE]);
  const lowerScale = scale.copy().range([midShare, props.minimumFillRate]);

  const clock = new ClockScale(0, 0, props.radius);

  const dataPoints = [];
  const slices = [];

  const upperPoints = [];
  const lowerPoints = [];

  const axisTextShare = -1 / props.categories.length / 2 + 1 / props.categories.length / 30;
  const axisTextAngle = 180 + clock.getAngleForShare(axisTextShare) / Math.PI * 180;
  const axisTextCoords = clock.getCoordsForShare(axisTextShare, midShare);

  _.each(props.categories, (cat, i) => {
    const upperCoords = clock.getCoordsForShare(
      (cat.category - 1) / props.categories.length,
      upperScale(cat.goodCount)
    );

    const lowerCoords = clock.getCoordsForShare(
      (cat.category - 1) / props.categories.length,
      lowerScale(cat.badCount)
    );

    upperPoints.push(upperCoords);
    lowerPoints.push(lowerCoords);

    const upperTextCoords = clock.getCoordsForShare(
      (cat.category - 1) / props.categories.length,
      midShare * 1.05
    );
    const lowerTextCoords = clock.getCoordsForShare(
      (cat.category - 1) / props.categories.length,
      midShare * 0.95
    );

    dataPoints.push(
      <g key={i} className={styles.counts}>
        <text x={upperTextCoords.x} y={upperTextCoords.y} className={styles.count}>
          {cat.goodCount}
        </text>
        <text x={lowerTextCoords.x} y={lowerTextCoords.y} className={styles.count}>
          {cat.badCount}
        </text>
      </g>
    );
  });

  const upperCurvePath = new ClosingPathContext();
  upperCurvePath.smoothCurve(upperPoints, { smoothness: 0.5, close: true });

  const lowerCurvePath = new ClosingPathContext();
  lowerCurvePath.smoothCurve(lowerPoints, { smoothness: 0.5, close: true });

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
      <g key={i}>
        <line x1={faceCoords.x} y1={faceCoords.y} x2={insetCoords.x} y2={insetCoords.y} />
        {props.showLabels &&
          <text x={textCoords.x} y={textCoords.y}>
            {cat.label}
          </text>}
      </g>
    );
  });

  const upperCurveMaskId = `curve-upper-${props.id}`;
  const lowerCurveMaskId = `curve-lower-${props.id}`;
  const clockMaskId = `clock-${props.id}`;

  const segments = slices.map((s, i) =>
    <path
      key={i}
      d={s}
      className={styles.segment}
      style={{ fill: props.palette[i] }}
      clipPath={`url(#${upperCurveMaskId})`}
      mask={`url(#${lowerCurveMaskId})`}
    />
  );

  return (
    <g className={props.className}>
      <defs>
        <clipPath id={clockMaskId}>
          <circle r={props.radius} cx="0" cy="0" opacity="0.5" />
        </clipPath>
        <clipPath id={upperCurveMaskId}>
          <path d={upperCurvePath} className={styles.curve} />
        </clipPath>
        <mask id={lowerCurveMaskId}>
          <circle r={props.radius} style={{ fill: 'white' }} />
          <path d={lowerCurvePath} style={{ fill: 'black' }} />
        </mask>
      </defs>
      <circle className={styles.outer} r={props.radius} cx="0" cy="0" />
      <g className={styles.ticks}>
        {tickMarks}
        {segments}
        <path d={upperCurvePath} className={styles.curve} />
        <path
          d={lowerCurvePath}
          className={styles.separator}
          style={{ fill: 'none', stroke: 'black', strokeWidth: 1 }}
        />
        {dataPoints}
      </g>
      <circle r={midRadius} cx="0" cy="0" className={styles.midRadius} />
      <text
        x={axisTextCoords.x}
        y={axisTextCoords.y}
        className={cx(styles.axisDescription, styles.upper)}
        transform={`rotate(${axisTextAngle} ${axisTextCoords.x} ${axisTextCoords.y})`}>
        &lt; Good&nbsp;
      </text>
      <text
        x={axisTextCoords.x}
        y={axisTextCoords.y}
        className={cx(styles.axisDescription, styles.lower)}
        transform={`rotate(${axisTextAngle} ${axisTextCoords.x} ${axisTextCoords.y})`}>
        &nbsp;Bad &gt;
      </text>
    </g>
  );
}
