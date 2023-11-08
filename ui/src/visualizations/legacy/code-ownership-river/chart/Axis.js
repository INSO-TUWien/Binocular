'use strict';

import React from 'react';
import * as d3 from 'd3';

export default class Axis extends React.Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this.updateD3();
  }

  componentDidUpdate() {
    this.updateD3();
  }

  updateD3() {
    const methodNames = {
      left: 'axisLeft',
      right: 'axisRight',
      top: 'axisTop',
      bottom: 'axisBottom',
    };

    const axisMethodName = methodNames[this.props.orient];

    const axis = d3[axisMethodName]();

    if (this.props.ticks) {
      axis.ticks(this.props.ticks);
    }

    if (this.props.scale) {
      axis.scale(this.props.scale);
    }

    if (this.props.tickSize) {
      axis.tickSize(this.props.tickSize);
    }

    d3.select(this.g).call(axis);
  }

  render() {
    const x = this.props.x || 0;
    const y = this.props.y || 0;
    const translate = `translate(${x}, ${y})`;

    return (
      <g>
        <g className="axis" ref={(g) => (this.g = g)} transform={translate} />
      </g>
    );
  }
}
