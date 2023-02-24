'use strict';

import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';

import styles from '../styles.scss';
import _ from 'lodash';
import Axis from './Axis.js';
import GridLines from './GridLines.js';
import CommitMarker from './CommitMarker.js';
import StackedArea from './StackedArea.js';

import Legend from '../../../../components/Legend';
import ZoomableChartContainer from '../../../../components/svg/ZoomableChartContainer.js';
import OffsetGroup from '../../../../components/svg/OffsetGroup.js';
import * as zoomUtils from '../../../../utils/zoom.js';

const dateExtractor = (d) => d.date;

export default class CodeOwnershipRiver extends React.Component {
  constructor(props) {
    super(props);
    this.elems = {};

    const { commitSeries, lastCommitDataPoint, commitLegend } = this.extractCommitData(props);

    this.state = {
      dirty: true,
      isPanning: false,
      lastCommitDataPoint,
      commitLegend,
      commitSeries,
      dimensions: zoomUtils.initialDimensions(),
    };

    const x = d3.scaleTime().rangeRound([0, 0]);
    const y = d3.scaleLinear().rangeRound([0, 0]);

    this.scales = {
      x,
      y,
      scaledX: x,
      scaledY: y,
    };

    this.commitExtractors = {
      x: (d) => d.date,
    };

    this.updateDomain(props);
    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: true, margin: 50 });
  }

  updateDomain(data) {
    if (!data.commits) {
      return;
    }

    let commits = data.commits;
    let builds = data.builds;
    let issues = data.issues;
    if (data.universalSettings) {
      commits = data.filteredCommits;
      builds = data.filteredBuilds;
      issues = data.filteredIssues;
    }

    const commitDateExtent = d3.extent(commits, (d) => d.date);
    const commitCountExtent = [0, _.last(commits).totals.count];

    const issueDateExtent = d3.extent(issues, (d) => d.createdAt);
    const issueCountExtent = d3.extent(issues, (d) => d.count);

    const buildDateExtent = d3.extent(builds, (b) => b.date);
    const buildCountExtent = d3.extent(builds, (b) => b.stats.total);

    const min = (arr) => _.min(_.pull(arr, null));
    const max = (arr) => _.max(_.pull(arr, null));

    this.scales.x.domain([
      min([commitDateExtent[0], issueDateExtent[0], buildDateExtent[0]]),
      max([commitDateExtent[1], issueDateExtent[1], buildDateExtent[1]]),
    ]);

    this.scales.y.domain([
      min([this.scales.y.domain()[0], commitCountExtent[0], issueCountExtent[0], buildCountExtent[0]]),
      max([this.scales.y.domain()[1], commitCountExtent[1], issueCountExtent[1], buildCountExtent[1]]),
    ]);
  }

  componentWillReceiveProps(nextProps) {
    const { commitSeries, lastCommitDataPoint, commitLegend } = this.extractCommitData(nextProps);
    this.setState(
      {
        lastCommitDataPoint,
        commitSeries,
        commitLegend,
      },
      () => this.updateDomain(nextProps)
    );
  }

  render() {
    if (!this.props.commits) {
      return <svg />;
    }
    let commits = this.props.commits;
    let builds = this.props.builds;
    let issues = this.props.issues;
    if (this.props.universalSettings) {
      commits = this.props.filteredCommits;
      builds = this.props.filteredBuilds;
      issues = this.props.filteredIssues;
    }

    const legend = [
      {
        name: 'Commits by author',
        subLegend: this.state.commitLegend,
      },
    ];

    if (issues.length > 0) {
      legend.push({
        name: 'issues by state',
        subLegend: [openIssuesLegend, closedIssuesLegend],
      });
    }

    if (builds.length > 0) {
      legend.push({
        name: 'Builds by state',
        subLegend: [successfulBuildsLegend, unsuccessfulBuildsLegend],
      });
    }

    const x = this.scales.scaledX;
    const y = this.scales.scaledY;

    const dims = this.state.dimensions;
    const today = x(new Date());
    const last = commits[commits.length - 1].date;
    this.scales.x.rangeRound([0, dims.width]);
    this.scales.y.rangeRound([dims.height, 0]);

    const commitMarkers = this.props.highlightedCommits.map((c, i) => {
      // for each commit marker, we need to recalculate the correct
      // y-coordinate by checking where that commit would go in our
      // commit data points
      const j = _.sortedIndexBy(commits, c, (other) => other.date.getTime());

      const cBefore = commits[j - 1];
      const cAfter = commits[j];
      const span = cAfter.date.getTime() - cBefore.date.getTime();
      const dist = c.date.getTime() - cBefore.date.getTime();
      const pct = dist / span;

      const countDiff = cAfter.totals.count - cBefore.totals.count;

      return (
        <CommitMarker
          key={i}
          commit={c}
          x={x(c.date)}
          y={y(cBefore.totals.count + countDiff * pct)}
          onClick={() => this.props.onCommitClick(c)}
        />
      );
    });

    return (
      <ZoomableChartContainer
        scaleExtent={[1, Infinity]}
        onZoom={(evt) => {
          this.onZoom(evt);
          this.props.onViewportChanged(this.scales.scaledX.domain());
        }}
        onResize={(dims) => this.onResize(dims)}
        onStart={(e) =>
          this.setState({
            isPanning: e.sourceEvent === null || e.sourceEvent.type !== 'wheel',
          })
        }
        onEnd={() => this.setState({ isPanning: false })}
        className={cx(styles.chart, { [styles.panning]: this.state.isPanning })}>
        <g>
          <defs>
            <clipPath id="chart">
              <rect x="0" y="0" width={dims.width} height={dims.height} />
            </clipPath>
            <clipPath id="x-only">
              <rect x="0" y={-dims.hMargin} width={dims.width} height={dims.fullHeight} />
            </clipPath>
          </defs>
          <OffsetGroup dims={dims}>
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
            <g id="StackedArea1" clipPath="url(#chart)" className={cx(styles.commitCount)}>
              <StackedArea
                data={commits}
                series={this.state.commitSeries}
                d3offset={d3.stackOffsetDiverging}
                x={x}
                y={y}
                extractX={dateExtractor}
                sum={_.sum}
                fillToRight={last}
              />
              {commitMarkers}
            </g>
            {this.props.highlightedIssue && (
              <defs>
                <mask id="issue-mask">
                  <rect x={0} y={0} width={dims.width} height={dims.height} style={{ stroke: 'none', fill: '#ffffff', opacity: 0.5 }} />
                  <rect
                    x={x(this.props.highlightedIssue.createdAt)}
                    y={0}
                    width={Math.max(3, x(this.props.highlightedIssue.closedAt || new Date()) - x(this.props.highlightedIssue.createdAt))}
                    height={dims.height}
                    style={{ stroke: 'none', fill: '#ffffff' }}
                  />
                </mask>
              </defs>
            )}
            <g id="StackedArea2" clipPath="url(#chart)" mask="url(#issue-mask)" className={cx(styles.openIssuesCount)}>
              <StackedArea
                data={issues}
                x={x}
                y={y}
                series={[
                  {
                    extractY: (i) => i.closedCount,
                    style: closedIssuesLegend.style,
                    className: styles.closedIssuesCount,
                    onMouseEnter: () => this.activateLegend(closedIssuesLegend),
                    onMouseLeave: () => this.activateLegend(null),
                  },
                  {
                    extractY: (i) => i.openCount,
                    style: openIssuesLegend.style,
                    onMouseEnter: () => this.activateLegend(openIssuesLegend),
                    onMouseLeave: () => this.activateLegend(null),
                  },
                ]}
                extractX={dateExtractor}
                sum={_.sum}
                fillToRight={last}
              />
            </g>
            <g id="StackedArea4" clipPath="url(#chart)" mask="url(#issue-mask)">
              <StackedArea
                data={builds}
                x={x}
                y={y}
                series={[
                  {
                    extractY: (b) => b.stats.success,
                    style: successfulBuildsLegend.style,
                    className: '',
                    onMouseEnter: () => this.activateLegend(successfulBuildsLegend),
                    onMouseLeave: () => this.activateLegend(null),
                  },
                  {
                    extractY: (b) => b.stats.failed,
                    style: unsuccessfulBuildsLegend.style,
                    onMouseEnter: () => this.activateLegend(unsuccessfulBuildsLegend),
                    onMouseLeave: () => this.activateLegend(null),
                  },
                ]}
                extractX={dateExtractor}
                sum={_.sum}
                fillToRight={last}
              />
            </g>
            <g className={styles.today} clipPath="url(#x-only)">
              <text x={today} y={-10}>
                Now
              </text>
              <line x1={today} y1={0} x2={today} y2={dims.height} />
            </g>
          </OffsetGroup>
          <Legend x="10" y="10" categories={this.state.hoverHint ? [this.state.hoverHint] : legend} />
        </g>
      </ZoomableChartContainer>
    );
  }

  activateLegend(legend) {
    this.setState({ hoverHint: legend });
  }

  extractCommitData(props) {
    if (!props.commits || props.commits.length === 0) {
      return {};
    }

    let commits = props.commits;

    if (props.universalSettings) {
      commits = props.filteredCommits;

      //merge author stats
      commits.map((c) => {
        const newStatsByAuthor = {};
        for (const mergedAuthor of props.mergedAuthors) {
          for (const committer of mergedAuthor.committers) {
            if (committer.signature in c.statsByAuthor) {
              if (!(mergedAuthor.mainCommitter in newStatsByAuthor)) {
                newStatsByAuthor[mergedAuthor.mainCommitter] = c.statsByAuthor[committer.signature];
              } else {
                const stats = newStatsByAuthor[mergedAuthor.mainCommitter];
                const additionalStats = c.statsByAuthor[committer.signature];
                stats.count += additionalStats.count;
                stats.additions += additionalStats.additions;
                stats.deletions += additionalStats.deletions;
                stats.changes += additionalStats.changes;

                newStatsByAuthor[mergedAuthor.mainCommitter] = stats;
              }
            }
          }
        }

        for (const otherAuthor of props.otherAuthors) {
          if (otherAuthor.signature in c.statsByAuthor) {
            if (!('others' in newStatsByAuthor)) {
              newStatsByAuthor['others'] = c.statsByAuthor[otherAuthor.signature];
            } else {
              const stats = newStatsByAuthor['others'];
              const additionalStats = c.statsByAuthor[otherAuthor.signature];
              stats.count += additionalStats.count;
              stats.additions += additionalStats.additions;
              stats.deletions += additionalStats.deletions;
              stats.changes += additionalStats.changes;

              newStatsByAuthor['others'] = stats;
            }
          }
        }

        c.statsByAuthor = newStatsByAuthor;
        return c;
      });

      commits = commits.map((commit) => {
        for (const author of Object.keys(commit.statsByAuthor)) {
          let filter = false;
          if (!props.selectedAuthors.includes('others')) {
            delete commit.statsByAuthor['others'];
          }

          for (const mergedAuthor of props.mergedAuthors) {
            if (author === mergedAuthor.mainCommitter) {
              if (props.selectedAuthors.filter((a) => a === mergedAuthor.mainCommitter).length > 0) {
                filter = true;
                break;
              } else {
                filter = false;
                break;
              }
            }
          }
          if (!filter && author !== 'others') {
            delete commit.statsByAuthor[author];
          }
        }
        return commit;
      });
    }

    const lastCommitDataPoint = _.last(commits).statsByAuthor;

    const commitLegend = [];
    const commitSeries = _.map(lastCommitDataPoint, (committerIndex, signature) => {
      const legend = {
        name:
          (props.commitAttribute === 'count' ? 'Commits by ' : 'Changes by ') +
          (signature === 'others' ? props.otherAuthors.length + ' Others' : signature),
        style: {
          fill: props.palette[signature === 'others' ? 'other' : signature],
        },
      };

      commitLegend.push(legend);

      return {
        style: {
          fill: props.palette[signature === 'others' ? 'other' : signature],
        },
        extractY: (d) => {
          const stats = d.statsByAuthor[signature];

          if (props.commitAttribute === 'count') {
            return stats ? stats.count : 0;
          } else {
            return stats ? (stats.changes / d.totals.changes) * d.totals.count : 0;
          }
        },
        onMouseEnter: () => this.activateLegend(legend),
        onMouseLeave: () => this.activateLegend(null),
      };
    });

    return { commitSeries, commitLegend };
  }
}

const openIssuesLegend = {
  name: 'Open issues',
  style: {
    fill: '#ff9eb1',
    stroke: '#ff3860',
  },
};

const closedIssuesLegend = {
  name: 'Closed issues',
  style: {
    fill: '#73e79c',
  },
};

const unsuccessfulBuildsLegend = {
  name: 'Unsuccessful builds',
  style: {
    fill: '#ff9eb1',
    stroke: '#ff3860',
  },
};

const successfulBuildsLegend = {
  name: 'Successful builds',
  style: {
    fill: '#73e79c',
  },
};
