'use strict';

import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import _ from 'lodash';

import styles from './styles.scss';
import Axis from './Axis.js';
import GridLines from './GridLines.js';

const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.000Z');

export default class CodeOwnershipRiver extends React.Component {
  constructor() {
    super();

    this.state = {
      dimensions: {
        width: 0,
        height: 0
      }
    };
  }

  componentDidMount() {
    this.updateD3();
  }

  componentDidUpdate() {
    this.updateD3();

    const zoom = d3.zoom().scaleExtent([1, 10]).on('zoom', () => this.zoom());
    d3.select(this.svg).call(zoom);
  }

  updateD3(/* props */) {}

  render() {
    const commitData = _.get(this.props, 'commits.data.commits', []);
    const commits = _.map(commitData, function(c, i) {
      return _.merge({}, c, { date: parseTime(c.date), commitCount: i + 1 });
    });

    const fullWidth = this.state.dimensions.width;
    const fullHeight = this.state.dimensions.height;
    const wPct = 0.8;
    const hPct = 0.6;

    const width = fullWidth * wPct;
    const height = fullHeight * hPct;
    const wMargin = (fullWidth - width) / 2;
    const hMargin = (fullHeight - height) / 2;

    const translate = `translate(${wMargin}, ${hMargin})`;

    const domain = d3.extent(commits, c => c.date);

    this.x = d3.scaleTime().rangeRound([0, width]).domain(domain);
    this.y = d3
      .scaleLinear()
      .rangeRound([height, 0])
      .domain(d3.extent(commits, c => c.commitCount));

    const line = d3
      .line()
      .x(c => this.x(c.date))
      .y(c => this.y(c.commitCount))
      .defined(c => c.date > domain[0] && c.date < domain[1]);

    return (
      <Measure onMeasure={dimensions => this.setState({ dimensions })}>
        <div>
          <svg className={styles.chart} ref={svg => (this.svg = svg)}>
            <g transform={translate}>
              <GridLines orient="left" ticks="10" scale={this.y} length={-width} />
              <GridLines orient="bottom" scale={this.x} y={height} length={-height} />
              <Axis orient="left" ticks="10" scale={this.y} />
              <Axis orient="bottom" scale={this.x} y={height} />
              <path d={line(commits)} stroke="black" strokeWidth="1" fill="none" />
            </g>
          </svg>
        </div>
      </Measure>
    );
  }

  zoom() {
    // d3.event.transform.rescaleX(this.x);
    // d3.event.transform.rescaleY(this.y);
  }
}
