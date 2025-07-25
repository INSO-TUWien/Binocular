'use strict';

import { ScaleContinuousNumeric } from 'd3-scale';

// Define interfaces for better type safety
export interface Dimensions {
  fullWidth: number;
  fullHeight: number;
  width: number;
  height: number;
  wMargin: number;
  hMargin: number;
}

export interface Scales {
  x: ScaleContinuousNumeric<number, number>;
  y: ScaleContinuousNumeric<number, number>;
  scaledX?: ScaleContinuousNumeric<number, number>;
  scaledY?: ScaleContinuousNumeric<number, number>;
}

export interface ComponentWithScales {
  scales?: Scales;
  setState: (state: {
    dimensions?: Dimensions;
    transform?: ZoomTransform;
    dirty?: boolean;
  }) => void;
  state: {
    dimensions: Dimensions;
    transform?: ZoomTransform;
    dirty?: boolean;
  };
}

export interface ZoomTransform {
  k: number;
  x: number;
  y: number;
  rescaleX: (scale: ScaleContinuousNumeric<number, number>) => ScaleContinuousNumeric<number, number>;
  rescaleY: (scale: ScaleContinuousNumeric<number, number>) => ScaleContinuousNumeric<number, number>;
  invertX: (x: number) => number;
  invertY: (y: number) => number;
}

export interface ZoomEvent {
  transform: ZoomTransform;
}

export interface ZoomOptions {
  constrain?: boolean;
  margin?: number;
}

export function initialDimensions(): Dimensions {
  return {
    fullWidth: 0,
    fullHeight: 0,
    width: 0,
    height: 0,
    wMargin: 0,
    hMargin: 0,
  };
}

export function onResizeFactory(wPct: number, hPct: number): (this: ComponentWithScales, dimensions: { width: number; height: number }) => void {
  return function onResize(dimensions: { width: number; height: number }): void {
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
        hMargin,
      },
    });
  };
}

// For functional components that don't have setState
export function onResizeFactoryForFunctional(wPct: number, hPct: number): (dimensions: { width: number; height: number }) => Dimensions {
  return function onResize(dimensions: { width: number; height: number }): Dimensions {
    const fullWidth = dimensions.width;
    const fullHeight = dimensions.height;

    const width = fullWidth * wPct;
    const height = fullHeight * hPct;
    const wMargin = (fullWidth - width) / 2;
    const hMargin = (fullHeight - height) / 2;

    return {
      fullWidth,
      fullHeight,
      width,
      height,
      wMargin,
      hMargin,
    };
  };
}

export function onZoomFactory(options: ZoomOptions = {}): (this: ComponentWithScales, evt: ZoomEvent) => void {
  const { constrain = true, margin = 0 } = options;
  const updateZoom = updateZoomFactory();

  if (constrain) {
    const constrainZoom = constrainZoomFactory(margin);
    return function(this: ComponentWithScales, evt: ZoomEvent): void {
      constrainZoom.call(this, evt.transform);
      updateZoom.call(this, evt);
    };
  } else {
    return updateZoom;
  }
}

export function updateZoomFactory(): (this: ComponentWithScales, evt: ZoomEvent) => void {
  return function updateZoom(this: ComponentWithScales, evt: ZoomEvent): void {
    if (this.scales && this.scales.x) {
      this.scales.scaledX = evt.transform.rescaleX(this.scales.x);
    }
    if (this.scales && this.scales.y) {
      this.scales.scaledY = evt.transform.rescaleY(this.scales.y);
    }

    this.setState({ transform: evt.transform, dirty: true });
  };
}

export function constrainZoomFactory(margin: number = 0): (this: ComponentWithScales, t: ZoomTransform) => void {
  return function constrainZoom(this: ComponentWithScales, t: ZoomTransform): void {
    const dims = this.state.dimensions;
    const [xMin, xMax] = this.scales!.x.domain().map((d: number) => this.scales!.x(d));
    const [yMin, yMax] = this.scales!.y.domain().map((d: number) => this.scales!.y(d));

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
