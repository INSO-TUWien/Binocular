'use strict';

import ChartContainer from './ChartContainer.js';
import ZoomableSvg from './ZoomableSvg.js';

const ZoomableChartContainer = function(props) {
  return (
    <ChartContainer onResize={props.onResize}>
      <ZoomableSvg
        scaleExtent={props.scaleExtent}
        onZoom={callSafe(props.onZoom)}
        onStart={callSafe(props.onStart)}
        onEnd={callSafe(props.onEnd)}
        onViewportChanged={callSafe(props.onViewportChanged)}
        className={props.className}>
        {props.children}
      </ZoomableSvg>
    </ChartContainer>
  );
};

export default ZoomableChartContainer;

function callSafe(fn) {
  if (fn) {
    return e => fn(e);
  }
}
