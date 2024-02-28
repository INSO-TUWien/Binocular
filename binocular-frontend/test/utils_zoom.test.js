'use strict';

import { initialDimensions, onResizeFactoryForFunctional } from '../src/utils/zoom';
import { expect } from 'chai';

describe('initialDimensions', function () {
  it('should initialize the Dimensions of the Zoom Factory', function () {
    const dimensions = initialDimensions();
    expect(dimensions.fullWidth).to.equal(0);
    expect(dimensions.fullHeight).to.equal(0);
    expect(dimensions.width).to.equal(0);
    expect(dimensions.height).to.equal(0);
    expect(dimensions.wMargin).to.equal(0);
    expect(dimensions.hMargin).to.equal(0);
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
    expect(dimensions.fullWidth).to.equal(100);
    expect(dimensions.fullHeight).to.equal(100);
    expect(dimensions.width).to.equal(80);
    expect(dimensions.height).to.equal(80);
    expect(dimensions.wMargin).to.equal(10);
    expect(dimensions.hMargin).to.equal(10);
  });
});
