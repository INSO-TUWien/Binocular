'use strict';

import { endpointUrl, getChartColors, shortenPath } from '../src/utils';
import { expect } from 'chai';
import jsdom from 'mocha-jsdom';

jsdom({
  url: 'http://localhost',
});

describe('endpointUrl', function () {
  it('should generate an endpointUrl with a provided suffix', function () {
    expect(endpointUrl('test').toString()).to.equal('http://localhost/api/test');
  });
});

describe('getChartColors', function () {
  it('should generate an color palette proving a band and elements', function () {
    const palette = getChartColors('spectral', ['c1', 'c2', 'c3']);
    //Check if palette has values for all 3 elements
    expect(Object.keys(palette).length).to.equal(3);
    //Check if all palette elements are hex values
    for (const paletteKey of Object.keys(palette)) {
      expect(palette[paletteKey].length).to.equal(7);
      expect(palette[paletteKey][0]).to.equal('#');
    }
  });
});

describe('shortenPath', function () {
  it('should shorten the provided path to the max length provided py replacing a part in the middel with ...', function () {
    const shortenedPath = shortenPath('http://localhost/api/test', 10);
    expect(shortenedPath).to.equal('ht…pi/test');
  });
});
