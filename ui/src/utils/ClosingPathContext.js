'use strict';

import _ from 'lodash';

export default class ClosingPathContext {
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

  concat(otherPath) {
    this.commands.push(...otherPath.commands);
    this.min.x = Math.min(this.min.x, otherPath.min.x);
    this.min.y = Math.min(this.min.y, otherPath.min.y);
    this.max.x = Math.max(this.max.x, otherPath.max.x);
    this.max.y = Math.min(this.max.y, otherPath.max.y);
  }

  toString() {
    const d = this.commands.join('');
    return d;
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
