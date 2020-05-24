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
    this.commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`);
  }

  /**
   * Draw a smooth curve that goes through each of the given
   * points. Points should be an array of objects holding x and y
   * properties.
   * 
   * The curve is drawn by concatenating a series of bezier curves
   * whose anchor points are interpolated to provide a smooth
   * transition from curve to curve.
   * 
   * The smoothness value describes the distance of the anchor points
   * from the respective curve point with respect to the distance to
   * the next point on the curve. Values larger than 1 can lead to
   * loops.
  **/
  smoothCurve(points, { smoothness = 0.5, close = false } = {}) {
    // make sure we start at the first point
    this.moveTo(points[0].x, points[0].y);

    // keep track of the first entry anchor for closing the loop
    let firstEntryAnchor = null;

    // keep track of the last point's exit anchor
    let exitAnchor = null;

    for (let i = 0; i < points.length; i++) {
      // in each iteration, we draw a bezier curve from the previous
      // point to the current one

      // current point to draw the bezier curve to
      const cur = points[i];

      // point from which to draw the bezier curve (use the last point
      // of the curve for the first point in case of drawing a closed
      // loop)
      const prev = points[i - 1] || (close ? points[points.length - 1] : cur);

      // next point needed for calculating the exit anchor of the
      // current point (use the first point for the last point in case
      // of drawing a closed loop)
      const next = points[i + 1] || (close ? points[0] : cur);

      // distances to previous and next points
      const dPrev = { x: prev.x - cur.x, y: prev.y - cur.y };
      const dNext = { x: next.x - cur.x, y: next.y - cur.y };

      // angles of beeline from current to previous and current to next
      const aPrev = Math.atan2(dPrev.y, dPrev.x);
      const aNext = Math.atan2(dNext.y, dNext.x);

      // length of line segments to prev and next
      const prevDist = Math.hypot(dPrev.x, dPrev.y);
      const nextDist = Math.hypot(dNext.x, dNext.y);

      // midpoint-angle on cur between aPrev and aNext
      const aAvg = (aPrev + aNext) / 2;

      const unitMidPoint = {
        x: Math.cos(aAvg),
        y: Math.sin(aAvg)
      };

      // take care to always take the smaller angle, or else our curve
      // might loop around its points
      const unitNormal =
        aNext - aPrev < Math.PI / 2 ? { x: -unitMidPoint.y, y: unitMidPoint.x } : { x: unitMidPoint.y, y: -unitMidPoint.x };

      // determine the entry anchor for the current point
      const entryAnchor = {
        x: cur.x + unitNormal.x * (prevDist * smoothness),
        y: cur.y + unitNormal.y * (prevDist * smoothness)
      };

      // take care to remember the first entry anchor if we want to
      // close the curve later
      firstEntryAnchor = firstEntryAnchor || entryAnchor;

      if (exitAnchor) {
        // if we already have an exit anchor (i.e. every iteration but
        // the first), draw the curve to the current point
        this.bezierCurveTo(exitAnchor.x, exitAnchor.y, entryAnchor.x, entryAnchor.y, cur.x, cur.y);
      }

      exitAnchor = {
        x: cur.x - unitNormal.x * (nextDist * smoothness),
        y: cur.y - unitNormal.y * (nextDist * smoothness)
      };
    }

    if (close) {
      // we still need to draw the closing line segment from the last
      // point to the first
      this.bezierCurveTo(exitAnchor.x, exitAnchor.y, firstEntryAnchor.x, firstEntryAnchor.y, points[0].x, points[0].y);
      this.closePath();
    }
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
