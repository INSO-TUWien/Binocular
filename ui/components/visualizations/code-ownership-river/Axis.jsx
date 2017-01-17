'use strict';

import React from 'react';
import cx from 'classnames';
import d3 from 'd3';

export default class Axis extends React.Component {
  render() {

    let translate = `translate(${this.props.axisMargin-3}, 0)`;
    
    return (
      <g className='axis' transform={translate}>
      </g>
    );
  }
}
