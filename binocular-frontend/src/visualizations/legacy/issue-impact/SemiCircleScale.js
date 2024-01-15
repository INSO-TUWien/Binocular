'use strict';

import _ from 'lodash';
import * as d3 from 'd3';

export default class SemiCircleScale {
  constructor(cx, cy, radius, options) {
    options = _.defaults({}, options, {
      offset: 0,
    });

    this.cx = cx;
    this.cy = cy;
    this.r = radius;
    this.offset = options.offset;
  }

  getAngleForShare(share) {
    return this.offset + Math.PI * share;
  }

  getCoordsForShare(share) {
    return this.getCoordsForAngle(this.getAngleForShare(share));
  }

  getCoordsForAngle(angle) {
    return {
      x: this.cx + this.r * Math.cos(angle),
      y: this.cy + this.r * Math.sin(angle),
    };
  }

  getArcForShares(startShare, endShare, sweep = false) {
    const p = d3.path();
    p.arc(this.cx, this.cy, this.r, 2 * Math.PI - Math.PI * endShare, 2 * Math.PI - Math.PI * startShare);
    return p;
  }

  getPieForShares(startShare, endShare, x1, x2) {
    const d = d3.path();
    d.moveTo(x1, this.cy);
    d.lineTo(x2, this.cy);
    d.arc(this.cx, this.cy, this.r, 2 * Math.PI - Math.PI * endShare, 2 * Math.PI - Math.PI * startShare);
    d.closePath();
    return d;
  }

  getAnnotationDataForShare(share) {
    const angle = this.getAngleForShare(share);
    const coords = this.getCoordsForShare(share);
    let textAngle;
    let anchor;
    if (angle > Math.PI / 2 && angle < Math.PI * 1.5) {
      textAngle = angle - Math.PI;
      anchor = 'end';
    } else {
      textAngle = angle;
      anchor = 'start';
    }

    textAngle *= -1;

    return {
      transform: `translate(${coords.x}, ${-coords.y}) ` + `rotate(${SemiCircleScale.rad2deg(textAngle)})`,
      textAnchor: anchor,
    };
  }

  extrude(d) {
    return new SemiCircleScale(this.cx, this.cy, this.r + d, { offset: this.offset });
  }

  static rad2deg(rad) {
    return (rad / Math.PI) * 180;
  }
}
