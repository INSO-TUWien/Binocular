'use strict';

import ChartContainer from './ChartContainer.js';
import CustomZoomableSvg from './CustomZoomableSvg.js';

const CustomZoomableChartContainer = function(props) {
  return (
    <ChartContainer>
      {dims =>
        <CustomZoomableSvg
          x={props.x}
          y={props.y}
          scaleExtent={props.scaleExtent}
          onZoom={wrapArgs(props.onZoom, dims)}
          onStart={wrapArgs(props.onStart, dims)}
          onEnd={wrapArgs(props.onEnd, dims)}
          onViewportChanged={wrapArgs(props.onViewportChanged, dims)}
          className={props.className}>
          {({ x, y }) => props.children({ x, y, dims })}
        </CustomZoomableSvg>}
    </ChartContainer>
  );
};

export default CustomZoomableChartContainer;

function wrapArgs(fn, dims) {
  if (fn) {
    return e => fn(e, dims);
  }
}
