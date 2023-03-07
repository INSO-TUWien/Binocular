import _ from 'lodash';
import * as d3 from 'd3';
import cx from 'classnames';

import ClockScale from './ClockScale.js';
import ClosingPathContext from '../../../../utils/ClosingPathContext.js';

import styles from '../styles.scss';

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

  const tickShare = 1 / props.categories.length;
  const halfTickShare = tickShare / 2;

  const clock = new ClockScale(0, 0, props.radius);
  const elems = [];
  const descriptionOffsetShare = (MAXIMUM_FILL_RATE - props.minimumFillRate) / 8;

  _.each(props.categories, (cat, i) => {
    const centerShare = i / props.categories.length;
    const leftShare = centerShare - halfTickShare;
    const rightShare = leftShare + tickShare;

    const topLeft = clock.getCoordsForShare(leftShare);
    const topRight = clock.getCoordsForShare(rightShare);
    const sTopLeft = clock.getCoordsForShare(leftShare, upperScale(cat.goodCount));
    const sTopRight = clock.getCoordsForShare(rightShare, upperScale(cat.goodCount));
    const sBottomLeft = clock.getCoordsForShare(leftShare, lowerScale(cat.badCount));
    const sBottomRight = clock.getCoordsForShare(rightShare, lowerScale(cat.badCount));

    const slice = new ClosingPathContext();
    slice.moveTo(sTopLeft.x, sTopLeft.y);
    const upperArcRadius = props.radius * upperScale(cat.goodCount);
    const lowerArcRadius = props.radius * lowerScale(cat.badCount);
    slice.arcTo(upperArcRadius, upperArcRadius, 0, 0, 1, sTopRight.x, -sTopRight.y);
    slice.lineTo(sBottomRight.x, sBottomRight.y);
    slice.arcTo(lowerArcRadius, lowerArcRadius, 0, 0, 0, sBottomLeft.x, -sBottomLeft.y);
    slice.lineTo(sTopLeft.x, sTopLeft.y);

    const descriptionTextCoords = clock.getCoordsForShare(centerShare, 1.05);
    const outerTextCoords = clock.getCoordsForShare(centerShare, midShare + descriptionOffsetShare);
    const innerTextCoords = clock.getCoordsForShare(centerShare, midShare - descriptionOffsetShare);

    elems.push(<path d={slice} style={{ fill: props.palette[i] }} />);
    elems.push(<line x1={0} y1={0} x2={topLeft.x} y2={topLeft.y} className={styles.tick} />);
    elems.push(<line x1={0} y1={0} x2={topRight.x} y2={topRight.y} className={styles.tick} />);
    elems.push(
      <text x={descriptionTextCoords.x} y={descriptionTextCoords.y}>
        {cat.label}
      </text>
    );
    elems.push(
      <g className={styles.counts}>
        <text x={outerTextCoords.x} y={outerTextCoords.y}>
          {cat.goodCount}
        </text>
        <text x={innerTextCoords.x} y={innerTextCoords.y}>
          {cat.badCount}
        </text>
      </g>
    );
  });

  const axisTextShare = -1 / props.categories.length / 2 + 1 / props.categories.length / 30;
  const axisTextAngle = 180 + (clock.getAngleForShare(axisTextShare) / Math.PI) * 180;
  const axisTextCoords = clock.getCoordsForShare(axisTextShare, midShare);

  return (
    <g className={props.className}>
      <defs />
      <circle className={styles.outer} r={props.radius} cx="0" cy="0" />
      <g className={styles.ticks} />
      {elems}
      <circle r={midRadius} cx="0" cy="0" className={styles.midRadius} />
      <text
        x={axisTextCoords.x}
        y={axisTextCoords.y}
        className={cx(styles.axisDescription, styles.upper)}
        transform={`rotate(${axisTextAngle} ${axisTextCoords.x} ${axisTextCoords.y})`}>
        &#9666; Good&nbsp;
      </text>
      <text
        x={axisTextCoords.x}
        y={axisTextCoords.y}
        className={cx(styles.axisDescription, styles.lower)}
        transform={`rotate(${axisTextAngle} ${axisTextCoords.x} ${axisTextCoords.y})`}>
        &nbsp;Bad &#9656;
      </text>
    </g>
  );
}
