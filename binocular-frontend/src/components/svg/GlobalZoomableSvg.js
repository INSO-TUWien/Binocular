'use strict';

import ZoomableSvg from './ZoomableSvg';
import * as d3 from 'd3';

/**
 * A variant of the ZoomableSvg which applies a simple global
 * transform for zooming
 */
const GlobalZoomableSvg = (props) => {
  const transform = props.transform;
  const translate = `translate(${transform.x}, ${transform.y})`;
  const scale = `scale(${transform.k})`;

  return (
    <ZoomableSvg className={props.className} x={d3.scaleLinear()} y={d3.scaleLinear()} onZoom={props.onZoom}>
      <g transform={`${translate} ${scale}`}>{props.children}</g>
      {props.unzoomed && <g>{props.unzoomed}</g>}
    </ZoomableSvg>
  );
};

export default GlobalZoomableSvg;
