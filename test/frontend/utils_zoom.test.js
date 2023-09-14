'use strict';

import { initialDimensions, onResizeFactoryForFunctional } from '../../ui/src/utils/zoom';

describe('initialDimensions', function () {
  it('should initialize the Dimensions of the Zoom Factory', function () {
    const dimensions = initialDimensions();
    expect(dimensions.fullWidth).toBe(0);
    expect(dimensions.fullHeight).toBe(0);
    expect(dimensions.width).toBe(0);
    expect(dimensions.height).toBe(0);
    expect(dimensions.wMargin).toBe(0);
    expect(dimensions.hMargin).toBe(0);
  });
});

describe('onResizeFactoryForFunctional', function () {
  it('should initialize the Dimensions of the Zoom Factory', function () {
    let dimensions = {
      fullWidth: 0,
      fullHeight: 0,
      width: 100,
      height: 100,
      wMargin: 0,
      hMargin: 0,
    };

    dimensions = onResizeFactoryForFunctional(0.8, 0.8)(dimensions);
    expect(dimensions.fullWidth).toBe(100);
    expect(dimensions.fullHeight).toBe(100);
    expect(dimensions.width).toBe(80);
    expect(dimensions.height).toBe(80);
    expect(dimensions.wMargin).toBe(10);
    expect(dimensions.hMargin).toBe(10);
  });
});
