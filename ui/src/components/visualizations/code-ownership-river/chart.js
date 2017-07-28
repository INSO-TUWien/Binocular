'use strict';

import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import cx from 'classnames';

import { ClosingPathContext } from '../../../utils.js';
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

    const commitPath = new ClosingPathContext();
    const commitLine = d3.line().x(c => x(c.date)).y(c => y(c.count)).context(commitPath);

    const openIssuesPath = new ClosingPathContext();
    const openIssuesLine = d3.line().x(i => x(i.date)).y(d => y(d.count)).context(openIssuesPath);

    const closedIssuesPath = new ClosingPathContext();
    const closedIssuesLine = d3
      .line()
      .x(i => x(i.date))
      .y(d => y(d.closedCount))
      .context(closedIssuesPath);

    commitLine(this.state.commits);
    openIssuesLine(this.state.issues);
    closedIssuesLine(this.state.issues);

    const today = x(new Date());
    commitPath.fillToRight(today);
    openIssuesPath.fillToRight(today);
    closedIssuesPath.fillToRight(today);

    commitPath.closeToBottom();
    openIssuesPath.closeToBottom();
    closedIssuesPath.closeToBottom();

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
                  <path d={commitPath} />
                  {estimatedVisibleCommitCount < 30 && commitMarkers}
                </g>
                <g clipPath="url(#chart)" className={cx(styles.openIssuesCount)}>
                  <path d={openIssuesPath} />
                </g>
                <g clipPath="url(#chart)" className={cx(styles.closedIssuesCount)}>
                  <path d={closedIssuesPath} />
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
    const dims = this.state.dimensions;

    const zoom = d3
      .zoom()
      .extent([[dims.wMargin, dims.hMargin], [dims.width, dims.height]])
      .translateExtent([[dims.wMargin, dims.hMargin], [dims.width, dims.height]])
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

  // holds close dates of still open issues, kept sorted at all times
  const pendingCloses = [];

  // issues closed so far
  let closeCountTotal = 0;

  return _.map(issueData, function(t, i) {
    const issueData = _.merge({}, t, {
      id: t.iid,
      date: parseTime(t.createdAt),
      closedAt: parseTime(t.closedAt),
      count: i + 1
    });

    // the number of closed issues at the issue's creation time, since
    // the last time we increased closedCountTotal
    let closedCount = _.sortedIndex(pendingCloses, issueData.date);

    closeCountTotal += closedCount;
    issueData.closedCount = closeCountTotal;
    issueData.openCount = issueData.count - issueData.closedCount;

    // remove all issues that are closed by now from the "pending" list
    pendingCloses.splice(0, closedCount);

    if (issueData.closedAt) {
      // issue has a close date, be sure to track it in the "pending" list
      const insertPos = _.sortedIndex(pendingCloses, issueData.closedAt);
      pendingCloses.splice(insertPos, 0, issueData.closedAt);
    } else {
      // the issue has not yet been closed, indicate that by pushing
      // null to the end of the pendingCloses list, which will always
      // stay there
      pendingCloses.push(null);
    }

    return issueData;
  });
}
