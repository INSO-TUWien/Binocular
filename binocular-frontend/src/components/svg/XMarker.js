'use strict';

import X from './X';

const XMarker = (props) => (
  <marker
    id={props.id || 'x'}
    className={props.markerClass}
    markerWidth="10"
    markerHeight="10"
    refX="5"
    refY="5"
    orient="auto"
    markerUnits="strokeWidth">
    <X />
  </marker>
);

export default XMarker;
