'use strict';

import React from 'react';
import * as d3 from 'd3';

export default class Axis extends React.Component {

  comonentDidMount() {
    this.renderAxis();
  }

  componentDidUpdate() {
    this.renderAxis();
  }

  renderAxis() {

    const node = this.refs.axis;

    const methodNames = {
      left: 'axisLeft',
      right: 'axisRight',
      top: 'axisTop',
      bottom: 'axisBottom'
    };

    const axisMethodName = methodNames[this.props.orient];

    const axis = d3[axisMethodName]();

    if( this.props.ticks ) {
      axis.ticks( this.props.ticks );
    }

    if( this.props.scale ) {
      axis.scale( this.props.scale );
    }


    d3.select( node ).call( axis );
  }

  render() {

    const x = this.props.x || 0;
    const y = this.props.y || 0;
    let translate = `translate(${x}, ${y})`;

    return (
      <g className='axis' ref='axis' transform={translate} />
    );
  }
}
