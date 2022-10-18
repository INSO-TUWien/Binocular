'use strict';

import * as d3 from 'd3';
import _ from 'lodash';
import React from 'react';

const labelTestData = [
  {
    label: 'person a',
    times: [
      { starting_time: 1355752800000, ending_time: 1355759900000 },
      { starting_time: 1355767900000, ending_time: 1355774400000 },
    ],
  },
  { label: 'person b', times: [{ starting_time: 1355759910000, ending_time: 1355761900000 }] },
  { label: 'person c', times: [{ starting_time: 1355761910000, ending_time: 1355763910000 }] },
];

export default class Timeline extends React.Component {
  constructor(props, styles) {
    super(props);
  }

  componentDidMount() {
    var xScale = d3.scaleTime().range([30, 750 - 30]);
    const axis = d3.axisBottom(xScale);
    d3.select(this.g).attr('width', 750).call(axis);
    // d3.select('#timeline')
  }

  render() {
    return <g className="timeline" ref={(g) => (this.g = g)} />;
  }
}
