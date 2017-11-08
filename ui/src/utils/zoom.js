'use strict';

export function initialDimensions() {
  return {
    fullWidth: 0,
    fullHeight: 0,
    width: 0,
    height: 0,
    wMargin: 0,
    hMargin: 0
  };
}

export function onResizeFactory(wPct, hPct) {
  return function onResize(dimensions) {
    const fullWidth = dimensions.width;
    const fullHeight = dimensions.height;

    const width = fullWidth * wPct;
    const height = fullHeight * hPct;
    const wMargin = (fullWidth - width) / 2;
    const hMargin = (fullHeight - height) / 2;

    if (this.scales && this.scales.x) {
      this.scales.x.rangeRound([0, width]);
    }
    if (this.scales && this.scales.y) {
      this.scales.y.rangeRound([height, 0]);
    }

    this.setState({
      dimensions: {
        fullWidth,
        fullHeight,
        width,
        height,
        wMargin,
        hMargin
      }
    });
  };
}

export function onZoomFactory({ constrain = true, margin = 0 } = {}) {
  const updateZoom = updateZoomFactory();

  if (constrain) {
    const constrainZoom = constrainZoomFactory(margin);
    return function(evt) {
      constrainZoom.call(this, evt.transform);
      updateZoom.call(this, evt);
    };
  } else {
    return updateZoom;
  }
}

export function updateZoomFactory() {
  return function updateZoom(evt) {
    if (this.scales && this.scales.x) {
      this.scales.scaledX = evt.transform.rescaleX(this.scales.x);
    }
    if (this.scales && this.scales.y) {
      this.scales.scaledY = evt.transform.rescaleY(this.scales.y);
    }

    console.log('set transform to', evt.transform);
    this.setState({ transform: evt.transform, dirty: true });
  };
}

export function constrainZoomFactory(margin = 0) {
  return function constrainZoom(t) {
    const dims = this.state.dimensions;
    const [xMin, xMax] = this.scales.x.domain().map(d => this.scales.x(d));
    const [yMin, yMax] = this.scales.y.domain().map(d => this.scales.y(d));

    if (t.invertX(xMin) < -margin) {
      t.x = -(xMin - margin) * t.k;
    }
    if (t.invertX(xMax) > dims.width + margin) {
      t.x = xMax - (dims.width + margin) * t.k;
    }
    if (t.invertY(yMax) < -margin) {
      t.y = -(yMax - margin) * t.k;
    }
    if (t.invertY(yMin) > dims.height) {
      t.y = yMin - dims.height * t.k;
    }
  };
}
