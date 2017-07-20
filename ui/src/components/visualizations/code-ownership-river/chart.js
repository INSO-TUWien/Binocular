'use strict';

import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import cx from 'classnames';

import styles from './styles.scss';
import _ from 'lodash';
import Axis from './Axis.js';
import GridLines from './GridLines.js';
import CommitMarker from './CommitMarker.js';

const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');

export default class CodeOwnershipRiver extends React.Component {
  constructor(props) {
    super(props);

    const commits = extractCommitData(props);
    const issues = extractIssueData(props);
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
      commits,
      issues
    };

    this.scales = {
      x: d3.scaleTime().rangeRound([0, 0]),
      y: d3.scaleLinear().rangeRound([0, 0])
    };

    this.updateDomain(commits, issues);
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

  updateDomain(commits, issues) {
    const commitDateExtent = d3.extent(commits, c => c.date);
    const commitCountExtent = d3.extent(commits, c => c.count);
    const issueDateExtent = d3.extent(issues, t => t.date);
    const issueCountExtent = d3.extent(issues, t => t.count);

    this.scales.x.domain([
      Math.min(commitDateExtent[0], issueDateExtent[0]),
      Math.max(commitDateExtent[1], issueDateExtent[1])
    ]);
    this.scales.y.domain([
      Math.min(commitCountExtent[0], issueCountExtent[0]),
      Math.max(commitCountExtent[1], issueCountExtent[1])
    ]);
  }

  componentWillReceiveProps(nextProps) {
    const commits = extractCommitData(nextProps);
    const issues = extractIssueData(nextProps);
    this.updateDomain(commits, issues);

    this.setState({ commits, issues });
  }

  render() {
    const dims = this.state.dimensions;

    const translate = `translate(${dims.wMargin}, ${dims.hMargin})`;

    const x = this.state.transform.rescaleX(this.scales.x);
    const y = this.state.transform.rescaleY(this.scales.y);

    const line = d3.line().x(d => x(d.date)).y(d => y(d.count));

    const fullDomain = this.scales.x.domain();
    const visibleDomain = x.domain();

    const fullSpan = fullDomain[1].getTime() - fullDomain[0].getTime();
    const visibleSpan = visibleDomain[1].getTime() - visibleDomain[0].getTime();

    const commitsPerMillisecond = this.state.commits.length / fullSpan;
    const estimatedVisibleCommitCount = commitsPerMillisecond * visibleSpan;

    const commitMarkers = this.state.commits.map(c => {
      return (
        <CommitMarker
          key={c.sha}
          commit={c}
          x={x(c.date)}
          y={y(c.count)}
          onClick={() => this.props.onCommitClick(c)}
        />
      );
    });

    const surround = data => [
      { count: 0, date: this.scales.x.domain()[0] },
      ...data,
      { count: 0, date: this.scales.x.domain()[1] }
    ];

    return (
      <Measure bounds onResize={dims => this.updateDimensions(dims.bounds)}>
        {({ measureRef }) =>
          <div
            tabIndex="1"
            ref={measureRef}
            onKeyPress={e => this.onKeyPress(e)}
            className={styles.chartContainer}>
            <svg className={styles.chart} ref={svg => (this.elems.svg = svg)}>
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
                    Amount
                  </text>
                </g>
                <g>
                  <Axis orient="bottom" scale={x} y={dims.height} />
                  <text x={dims.width / 2} y={dims.height + 50} textAnchor="middle">
                    Time
                  </text>
                </g>
                <g clipPath="url(#chart)" className={cx(styles.commitCount)}>
                  <path d={line(surround(this.state.commits))} />
                  {estimatedVisibleCommitCount < 30 && commitMarkers}
                </g>
                <g clipPath="url(#chart)" className={cx(styles.issueCount)}>
                  <path d={line(surround(this.state.issues))} />
                </g>
              </g>
            </svg>
          </div>}
      </Measure>
    );
  }

  onKeyPress(e) {
    if (e.key === '=' || e.key === '0') {
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

    const zoom = d3
      .zoom()
      .translateExtent([[0, 0], [Infinity, 1000]])
      .scaleExtent([1, Infinity])
      .on('zoom', () => this.updateZoom(d3.event));
    svg.call(zoom);
  }
}

function extractCommitData(props) {
  const commitData = _.get(props, 'commits', []);
  return _.map(commitData, function(c, i) {
    return _.merge({}, c, { sha: c.sha, date: parseTime(c.date), count: i + 1 });
  });
}

function extractIssueData(props) {
  const issueData = _.get(props, 'issues', []);
  return _.map(issueData, function(t, i) {
    return _.merge({}, t, { id: t.iid, date: parseTime(t.created_at), count: i + 1 });
  });
}
