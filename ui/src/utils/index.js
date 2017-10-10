'use strict';

import * as d3 from 'd3';
import _ from 'lodash';
import Promise from 'bluebird';
import chroma from 'chroma-js';

export const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');

export function endpointUrl(suffix) {
  return getBaseUrl() + suffix;
}

export function basename(path) {
  return path.substring(path.lastIndexOf('/') + 1);
}

export function getBaseUrl() {
  return `${window.location.protocol}//${window.location.host}/api/`;
}

export function getChartColors(band, kinds) {
  const colors = chroma.scale(band).mode('lch').colors(kinds.length);

  const ret = {};
  for (let i = 0; i < kinds.length; i++) {
    ret[kinds[i]] = colors[i];
  }

  return ret;
}

export { default as ClosingPathContext } from './ClosingPathContext.js';

export * from './graphQl.js';
