'use strict';

import Asterisk from './Asterisk';

const AsteriskMarker = props =>
  <marker
    id={props.id || 'asterisk'}
    className={props.markerClass}
    markerWidth="11.2"
    markerHeight="11.2"
    refX="5.6"
    refY="5.6"
    orient="auto"
    markerUnits="strokeWidth">
    <Asterisk />
  </marker>;

export default AsteriskMarker;
