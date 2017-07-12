'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from './styles.scss';

export default class GridLines extends React.Component {
  comonentDidMount() {
    this.renderAxis();
  }

  componentDidUpdate() {
    this.renderAxis();
  }

  renderAxis() {
    const node = this.refs.grid;

    const methodNames = {
      left: 'axisLeft',
      right: 'axisRight',
      top: 'axisTop',
      bottom: 'axisBottom'
    };

    const axisMethodName = methodNames[this.props.orient];

    const axis = d3[axisMethodName]();

    if (this.props.ticks) {
      axis.ticks(this.props.ticks);
    }

    if (this.props.scale) {
      axis.scale(this.props.scale);
    }

    if (this.props.length) {
      axis.tickSize(-this.props.length);
    }

    axis.tickSizeOuter(10);
    axis.tickFormat('');

    d3.select(node).call(axis);
  }

  render() {
    const x = this.props.x || 0;
    const y = this.props.y || 0;
    let translate = `translate(${x}, ${y})`;

    return <g className={styles.grid} ref="grid" transform={translate} />;
  }
}
