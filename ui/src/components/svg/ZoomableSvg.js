'use strict';

import CustomZoomableSvg from './CustomZoomableSvg.js';
import * as d3 from 'd3';

const ZoomableSvg = props =>
  <CustomZoomableSvg className={props.className} x={d3.scaleLinear()} y={d3.scaleLinear()}>
    {({ transform }) => {
      const translate = `translate(${transform.x}, ${transform.y})`;
      const scale = `scale(${transform.k})`;

      return (
        <g transform={`${translate} ${scale}`}>
          {props.children}
        </g>
      );
    }}
  </CustomZoomableSvg>;

export default ZoomableSvg;
