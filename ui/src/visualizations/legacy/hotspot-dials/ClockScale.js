'use strict';

import { ClosingPathContext } from '../../../utils';

const OFFSET = -Math.PI / 2;

export default class SemiCircleScale {
  constructor(cx, cy, radius) {
    this.cx = cx;
    this.cy = cy;
    this.r = radius;
  }

  getAngleForShare(share) {
    return OFFSET + 2 * Math.PI * share;
  }

  getCoordsForShare(share, vshare = 1) {
    return this.getCoordsForAngle(this.getAngleForShare(share), vshare);
  }

  getCoordsForAngle(angle, vshare = 1) {
    return {
      x: this.cx + this.r * vshare * Math.cos(angle),
      y: this.cy + this.r * vshare * Math.sin(angle)
    };
  }

  getArcForShares(startShare, endShare, sweep = false) {
    const startAngle = this.getAngleForShare(startShare);
    const endAngle = this.getAngleForShare(endShare);
    const start = this.getCoordsForAngle(startAngle);
    const end = this.getCoordsForAngle(endAngle);

    const ctx = new ClosingPathContext();
    ctx.moveTo(start.x, -start.y);
    ctx.arcTo(this.r, this.r, 0, startAngle - endAngle > Math.PI, sweep, end.x, end.y);

    return ctx;
  }

  getPieForShares(startShare, endShare, x1, x2) {
    const d = new ClosingPathContext();
    const start = this.getCoordsForShare(startShare);
    const end = this.getCoordsForShare(endShare);
    d.moveTo(start.x, -start.y);
    d.lineTo(x1, this.cy);
    d.lineTo(x2, this.cy);
    d.lineTo(end.x, -end.y);

    const closer = this.getArcForShares(endShare, startShare, true);
    d.closeToPath(closer, false);
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
      textAnchor: anchor
    };
  }

  static rad2deg(rad) {
    return rad / Math.PI * 180;
  }
}
