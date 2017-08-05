'use strict';

const Asterisk = props => (
  <marker
    id={props.id || 'x'}
    className={props.markerClass}
    markerWidth="10"
    markerHeight="10"
    refX="5"
    refY="5"
    orient="auto"
    markerUnits="strokeWidth">
    <path d="M0,0 L10,10 M0,10 L10,0 z" />
  </marker>
);

export default Asterisk;
