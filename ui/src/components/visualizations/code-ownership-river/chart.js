'use strict';

import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import styles from './styles.scss';
import _ from 'lodash';
import Axis from './Axis.js';
import GridLines from './GridLines.js';

const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.000Z');

export default class CodeOwnershipRiver extends React.Component {
  constructor(props) {
    super(props);

    const commits = extractCommitData(props);
    this.elems = {};
    this.state = {
      dimensions: {
        fullWidth: 0,
        fullHeight: 0,
        width: 0,
        height: 0,
        wMargin: 0,
        hMargin: 0
      },
      transform: d3.zoomIdentity,
      commits
    };

    this.scales = {
      x: d3.scaleTime().rangeRound([0, 0]),
      y: d3.scaleLinear().rangeRound([0, 0])
    };

    this.updateDomain(commits);
  }

  updateZoom(evt) {
    this.setState({ transform: evt.transform });
  }

  updateDimensions(dimensions) {
    const fullWidth = dimensions.width;
    const fullHeight = dimensions.height;
    const wPct = 0.7;
    const hPct = 0.7;

    const width = fullWidth * wPct;
    const height = fullHeight * hPct;
    const wMargin = (fullWidth - width) / 2;
    const hMargin = (fullHeight - height) / 2;

    this.scales.x.rangeRound([0, width]);
    this.scales.y.rangeRound([height, 0]);

    this.setState({
      dimensions: {
        fullWidth,
        fullHeight,
        width,
        height,
        wMargin,
        hMargin
      }
    });
  }

  updateDomain(commits) {
    const dateExtent = d3.extent(commits, c => c.date);
    const countExtent = d3.extent(commits, c => c.commitCount);
    this.scales.x.domain(dateExtent);
    this.scales.y.domain(countExtent);
  }

  componentWillReceiveProps(nextProps) {
    const commits = extractCommitData(nextProps);
    this.updateDomain(commits);

    this.setState({ commits });
  }

  render() {
    const dims = this.state.dimensions;

    const translate = `translate(${dims.wMargin}, ${dims.hMargin})`;

    const x = this.state.transform.rescaleX(this.scales.x);
    const y = this.state.transform.rescaleY(this.scales.y);

    const line = d3.line().x(c => x(c.date)).y(c => y(c.commitCount));
    const today = new Date();

    return (
      <Measure bounds onResize={dims => this.updateDimensions(dims.bounds)}>
        {({ measureRef }) => (
          <div
            tabIndex="1"
            ref={measureRef}
            onKeyPress={e => this.onKeyPress(e)}
            className={styles.chartContainer}>
            <svg className={styles.chart} ref={svg => this.elems.svg = svg}>
              <defs>
                <clipPath id="chart">
                  <rect x="0" y="0" width={dims.width} height={dims.height} />
                </clipPath>
              </defs>
              <g transform={translate}>
                <GridLines orient="left" scale={y} ticks="10" length={dims.width} />
                <GridLines orient="bottom" scale={x} y={dims.height} length={dims.height} />
                <g>
                  <Axis orient="left" ticks="10" scale={y} />
                  <text x={-dims.height / 2} y={-50} textAnchor="middle" transform="rotate(-90)">
                    Number of Commits
                  </text>
                </g>
                <g>
                  <Axis orient="bottom" scale={x} y={dims.height} />
                  <text x={dims.width / 2} y={dims.height + 50} textAnchor="middle">
                    Time
                  </text>
                </g>
                <path
                  clipPath="url(#chart)"
                  d={line(this.state.commits)}
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
              </g>
            </svg>
          </div>
        )}
      </Measure>
    );
  }

  onKeyPress(e) {
    if (e.key === '=') {
      this.resetZoom();
    }
  }

  resetZoom() {
    this.setState({
      transform: d3.zoomIdentity
    });
  }

  componentDidUpdate() {
    const svg = d3.select(this.elems.svg);

    const x = this.state.transform.rescaleX(this.scales.x);
    const y = this.state.transform.rescaleY(this.scales.y);

    const yMax = this.scales.y.domain()[1];
    console.log('raw max:', yMax);
    console.log('normal scaled max:', this.scales.y(yMax));
    console.log('zoom-scaled max:', y(yMax));

    const zoom = d3
      .zoom()
      .translateExtent([[0, 0], [Infinity, 1000]])
      .scaleExtent([1, Infinity])
      .on('zoom', () => this.updateZoom(d3.event));
    svg.call(zoom);
  }
}

function extractCommitData(props) {
  const commitData = _.get(props, 'commits.data.commits', []);
  return _.map(commitData, function(c, i) {
    return _.merge({}, c, { date: parseTime(c.date), commitCount: i + 1 });
  });
}
