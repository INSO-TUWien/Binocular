'use strict';

import * as d3 from 'd3';
import _ from 'lodash';
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

export function reduceTo(src, length, eligible = () => true) {
  if (src.length <= length) {
    return src;
  }

  const s = 1 - length / src.length;
  const ret = [];
  let c = 0;
  for (let i = 0; i < src.length; i++) {
    c += s;
    if (c < 1 || !eligible(src[i])) {
      ret.push(src[i]);
    } else {
      c--;
    }
  }

  return ret;
}

export function getChartColors(band, kinds) {
  const colors = chroma.scale(band).mode('lch').colors(kinds.length);

  const ret = {};
  for (let i = 0; i < kinds.length; i++) {
    ret[kinds[i]] = colors[i];
  }

  return ret;
}

export class ClosingPathContext {
  constructor() {
    this.commands = [];
    this.min = { x: Infinity, y: Infinity };
    this.max = { x: -Infinity, y: -Infinity };
    this.last = { x: 0, y: 0 };
  }

  closePath() {
    if (this.commands.length > 0) {
      this.commands.push('Z');
    }
  }

  closeToBottom() {
    if (this.commands.length > 0) {
      this.lineTo(this.max.x, this.max.y);
      this.closePath();
    }
  }

  closeToPath(other, addCloseCommand = true) {
    for (let i = other.commands.length - 1; i >= 0; i--) {
      this.commands.push(other.commands[i]);
    }

    if (addCloseCommand) {
      this.closePath();
    }
  }

  fillToRight(max) {
    if (this.commands.length > 0 && isNumeric(max)) {
      this.lineTo(max, this.last.y);
    }
  }

  moveTo(x, y) {
    if (isNumeric(x) && isNumeric(y)) {
      this.trackPen(x, y);
      this.commands.push('M' + x + ',' + y);
    }
  }

  lineTo(x, y) {
    if (isNumeric(x) && isNumeric(y)) {
      this.trackPen(x, y);
      this.commands.push('L' + x + ',' + y);
    }
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    console.log('quadraticCurveTo', cpx, cpy, x, y);
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    console.log('bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y);
  }

  arcTo(rx, ry, xRot, largeArcFlag, sweepFlag, x, y) {
    const arc = largeArcFlag ? '1' : '0';
    const sweep = sweepFlag ? '1' : '0';
    this.commands.push(`A${rx},${ry},0,${arc},${sweep},${x},${-y}`);
  }

  rect(x, y, w, h) {
    console.log('rect', x, y, w, h);
  }

  arc(x, y, radius, startAngle, endAngle, counterClockwise) {
    console.log('arc', x, y, radius, startAngle, endAngle, counterClockwise);
  }

  trackPen(x, y) {
    this.min.x = Math.min(this.min.x, x);
    this.min.y = Math.min(this.min.y, y);
    this.max.x = Math.max(this.max.x, x);
    this.max.y = Math.max(this.max.y, y);
    this.last = { x, y };
  }

  clone() {
    const clone = new ClosingPathContext();
    clone.commands = _.clone(this.commands);
    clone.min = _.clone(this.min);
    clone.max = _.clone(this.max);
    clone.last = _.clone(this.last);
    return clone;
  }

  reverse() {
    this.commands.reverse();
    return this;
  }

  toString() {
    const d = this.commands.join('');
    return d;
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function traversePages(getPage, fn, countFn, pageNumber = 1, perPage = 100) {
  return getPage(pageNumber, perPage).then(page => {
    countFn(page.count);
    _.each(page.data, fn);
    if (page.data.length + (page.page - 1) * page.perPage < page.count) {
      return traversePages(getPage, fn, () => null, pageNumber + 1, perPage);
    }
  });
}

import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';
const graphQl = new Lokka({ transport: new Transport('/graphQl') });

export { graphQl };
