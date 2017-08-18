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
import Asterisk from '../../svg/Asterisk.js';
import X from '../../svg/X.js';
import StackedArea from './StackedArea.js';

const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');

export default class CodeOwnershipRiver extends React.Component {
  constructor(props) {
    super(props);

    const { commits, highlightedCommits } = extractCommitData(props);
    const issues = extractIssueData(props);
    this.elems = {};
    this.state = {
      dirty: true,
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
      issues,
      highlightedIssueData: _.find(issues, i => i.iid === _.get(props, 'highlightedIssue.iid')),
      highlightedCommits,
      isPanning: false
    };

    this.scales = {
      x: d3.scaleTime().rangeRound([0, 0]),
      y: d3.scaleLinear().rangeRound([0, 0])
    };

    this.updateDomain(commits, issues);
  }

  updateZoom(evt) {
    this.setState({ transform: evt.transform, dirty: true });
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

    const min = arr => _.min(_.compact(arr));
    const max = arr => _.max(_.compact(arr));

    this.scales.x.domain([
      min([commitDateExtent[0], issueDateExtent[0]]),
      max([commitDateExtent[1], issueDateExtent[1]])
    ]);
    this.scales.y.domain([
      min([commitCountExtent[0], issueCountExtent[0]]),
      max([commitCountExtent[1], issueCountExtent[1]])
    ]);
  }

  componentWillReceiveProps(nextProps) {
    const { commits, highlightedCommits } = extractCommitData(nextProps);
    const issues = extractIssueData(nextProps);
    this.updateDomain(commits, issues);

    this.setState(
      {
        commits,
        issues,
        highlightedIssueData: _.find(
          issues,
          i => i.iid === _.get(nextProps, 'highlightedIssue.iid')
        ),
        highlightedCommits
      },
      () => {
        if (!this.state.dirty) {
          this.resetZoom();
        }
      }
    );
  }

  render() {
    if (this.state.commits.length + this.state.issues.length === 0) {
      return <svg />;
    }

    const dims = this.state.dimensions;

    const translate = `translate(${dims.wMargin}, ${dims.hMargin})`;

    const x = this.state.transform.rescaleX(this.scales.x);
    const y = this.state.transform.rescaleY(this.scales.y);

    const today = x(new Date());

    const fullDomain = this.scales.x.domain();
    const visibleDomain = x.domain();

    const fullSpan = fullDomain[1].getTime() - fullDomain[0].getTime();
    const visibleSpan = visibleDomain[1].getTime() - visibleDomain[0].getTime();

    const commitsPerMillisecond = this.state.commits.length / fullSpan;
    const estimatedVisibleCommitCount = commitsPerMillisecond * visibleSpan;

    const buildCommitMarker = c => {
      return (
        <CommitMarker
          key={c.sha}
          commit={c}
          x={x(c.date)}
          y={y(c.count)}
          onClick={() => this.props.onCommitClick(c)}
        />
      );
    };

    const commitMarkers = this.state.commits.map(buildCommitMarker);

    let highlightedIssueCoords, highlightedCommitMarkers;
    if (this.props.highlightedIssue) {
      const hid = this.state.highlightedIssueData;
      highlightedIssueCoords = {
        start: {
          x: x(hid.date),
          y: y(hid.openCount + hid.closedCount)
        },
        end: {
          x: hid.closedAt ? x(hid.closedAt) : today,
          y: y(hid.openCount + hid.closedCount)
        }
      };

      const start = x(parseTime(this.props.highlightedIssue.createdAt).getTime());
      const end = x(
        (this.props.highlightedIssue.closedAt
          ? parseTime(this.props.highlightedIssue.closedAt)
          : new Date()).getTime()
      );
      const dist = end - start;
      const avg = dist / this.state.highlightedCommits.length;

      highlightedCommitMarkers = this.state.highlightedCommits.map((c, i) => {
        return (
          <line
            className={styles.highlightedCommit}
            key={c.sha}
            x1={x(c.date)}
            y1={y(c.count)}
            x2={start + i * avg}
            y2={highlightedIssueCoords.start.y}
          />
        );
      });
    }

    return (
      <Measure bounds onResize={dims => this.updateDimensions(dims.bounds)}>
        {({ measureRef }) =>
          <div
            tabIndex="1"
            ref={measureRef}
            onKeyPress={e => this.onKeyPress(e)}
            className={styles.chartContainer}>
            <svg
              className={cx(styles.chart, { [styles.panning]: this.state.isPanning })}
              ref={svg => (this.elems.svg = svg)}>
              <defs>
                <clipPath id="chart">
                  <rect x="0" y="0" width={dims.width} height={dims.height} />
                </clipPath>
                <clipPath id="x-only">
                  <rect x="0" y={-dims.hMargin} width={dims.width} height={dims.fullHeight} />
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
                  <StackedArea
                    data={this.state.commits}
                    series={[{ extract: c => c.count }]}
                    x={c => x(c.date)}
                    y={values => y(_.sum(values))}
                    fillToRight={today}
                  />
                  {estimatedVisibleCommitCount < 30 && commitMarkers}
                </g>
                <g clipPath="url(#chart)" className={cx(styles.openIssuesCount)}>
                  <StackedArea
                    data={this.state.issues}
                    series={[
                      {
                        extract: i => i.closedCount,
                        color: 'hsl(141, 71%, 48%)',
                        className: styles.closedIssuesCount
                      },
                      {
                        extract: i => i.openCount,
                        className: styles.openIssuesCount
                      }
                    ]}
                    x={i => x(i.date)}
                    y={values => y(_.sum(values))}
                    fillToRight={today}
                  />
                </g>
                {this.props.highlightedIssue &&
                  <g clipPath="url(#chart)" className={cx(styles.highlightedIssue)}>
                    <defs>
                      <Asterisk markerClass={styles.lineMarker} />
                      <X markerClass={styles.lineMarker} />
                    </defs>
                    <line
                      className={styles.highlightedIssueLine}
                      x1={highlightedIssueCoords.start.x}
                      y1={highlightedIssueCoords.start.y}
                      x2={highlightedIssueCoords.end.x}
                      y2={highlightedIssueCoords.end.y}
                    />
                    <line
                      className={styles.lineMarker}
                      x1={highlightedIssueCoords.start.x}
                      y1={highlightedIssueCoords.start.y}
                      x2={highlightedIssueCoords.end.x}
                      y2={highlightedIssueCoords.end.y}
                      markerStart="url(#asterisk)"
                      markerEnd={this.state.highlightedIssueData.closedAt ? 'url(#x)' : ''}
                    />
                  </g>}
                <g clipPath="url(#chart)" className={cx(styles.closedIssuesCount)}>
                  {highlightedCommitMarkers}
                </g>
                <g className={styles.today} clipPath="url(#x-only)">
                  <text x={today} y={-10}>
                    Now
                  </text>
                  <line x1={today} y1={0} x2={today} y2={dims.height} />
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
      dirty: false,
      transform: d3.zoomIdentity
    });
  }

  componentWillUnmount() {
    if (this.zoom) {
      this.zoom.on('zoom', null);
      this.zoom.on('start', null);
      this.zoom.on('end', null);
    }
  }

  componentDidUpdate() {
    const svg = d3.select(this.elems.svg);

    this.zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .on('zoom', () => {
        this.constrainZoom(d3.event.transform, 50);
        this.updateZoom(d3.event);
      })
      .on('start', () => this.setState({ isPanning: d3.event.sourceEvent.type !== 'wheel' }))
      .on('end', () => this.setState({ isPanning: false }));

    svg.call(this.zoom);
  }

  constrainZoom(t, margin = 0) {
    const dims = this.state.dimensions;
    const [xMin, xMax] = this.scales.x.domain().map(d => this.scales.x(d));
    const [yMin, yMax] = this.scales.y.domain().map(d => this.scales.y(d));

    if (t.invertX(xMin) < -margin) {
      t.x = -(xMin - margin) * t.k;
    }
    if (t.invertX(xMax) > dims.width + margin) {
      t.x = xMax - (dims.width + margin) * t.k;
    }
    if (t.invertY(yMax) < -margin) {
      t.y = -(yMax - margin) * t.k;
    }
    if (t.invertY(yMin) > dims.height) {
      t.y = yMin - dims.height * t.k;
    }
  }
}

function extractCommitData(props) {
  const commitData = _.get(props, 'commits', []);
  const mentions = _.get(props, 'highlightedIssue.mentions', []);
  const highlightedCommits = [];

  const commits = _.map(commitData, function(c, i) {
    const ret = _.merge({}, c, { sha: c.sha, date: parseTime(c.date), count: i + 1 });
    if (_.includes(mentions, c.sha)) {
      console.log('found!');
      highlightedCommits.push(ret);
    }

    return ret;
  });

  return { commits, highlightedCommits };
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
