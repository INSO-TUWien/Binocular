'use strict';

export function endpointUrl(suffix) {
  return getBaseUrl() + suffix;
}

export function getBaseUrl() {
  return `${window.location.protocol}//${window.location.host}/api/`;
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

  closeToPath(other) {
    for (let i = other.commands.length - 1; i >= 0; i--) {
      this.commands.push(other.commands[i]);
    }

    this.closePath();
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

  arcTo(x1, y1, x2, y2, radius) {
    console.log('arcTo', x1, y1, x2, y2, radius);
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

  toString() {
    const d = this.commands.join(',');
    return d;
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
