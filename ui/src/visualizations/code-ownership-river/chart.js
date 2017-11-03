'use strict';

import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import cx from 'classnames';
import chroma from 'chroma-js';

import styles from './styles.scss';
import _ from 'lodash';
import Axis from './Axis.js';
import GridLines from './GridLines.js';
import CommitMarker from './CommitMarker.js';
import StackedArea from './StackedArea.js';

import AsteriskMarker from '../../components/svg/AsteriskMarker.js';
import XMarker from '../../components/svg/XMarker.js';
import Legend from '../../components/Legend';
import CustomZoomableChartContainer from '../../components/svg/CustomZoomableChartContainer.js';
import OffsetGroup from '../../components/svg/OffsetGroup.js';

const dateExtractor = d => d.date;

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
      commitSeries
    };

    const x = d3.scaleTime().rangeRound([0, 0]);
    const y = d3.scaleLinear().rangeRound([0, 0]);

    this.scales = {
      x,
      y,
      scaledX: x,
      scaledY: y
    };

    this.commitExtractors = {
      x: d => d.date
    };

    this.updateDomain(props);
  }

  updateDomain(data) {
    if (!data.commits) {
      return;
    }

    const commitDateExtent = d3.extent(data.commits, d => d.date);
    const commitCountExtent = [0, _.last(data.commits).totals.count];

    const issueDateExtent = d3.extent(data.issues, d => d.createdAt);
    const issueCountExtent = d3.extent(data.issues, d => d.count);

    const min = arr => _.min(_.pull(arr, null));
    const max = arr => _.max(_.pull(arr, null));

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
    const { commitSeries, lastCommitDataPoint, commitLegend } = this.extractCommitData(nextProps);
    this.setState(
      {
        lastCommitDataPoint,
        commitSeries,
        commitLegend
      },
      () => this.updateDomain(nextProps)
    );
  }

  render() {
    if (!this.props.commits) {
      return <svg />;
    }

    const legend = [
      {
        name: 'Commits by author',
        subLegend: this.state.commitLegend
      }
    ];

    if (this.props.issues.length > 0) {
      legend.push({
        name: 'Issues by state',
        subLegend: [openIssuesLegend, closedIssuesLegend]
      });
    }

    return (
      <CustomZoomableChartContainer
        x={this.scales.x}
        y={this.scales.y}
        scaleExtent={[1, Infinity]}
        onZoom={(e, dims) => {
          this.constrainZoom(e, dims, 50);
        }}
        onViewportChanged={(xDomain, yDomain) => this.props.onViewportChanged(xDomain, yDomain)}
        onStart={e =>
          this.setState({
            isPanning: e.sourceEvent == null || d3.event.sourceEvent.type !== 'wheel'
          })}
        onEnd={() => this.setState({ isPanning: false })}
        className={cx(styles.chart, { [styles.panning]: this.state.isPanning })}>
        {({ x, y, dims }) => {
          const today = x(new Date());
          this.scales.x.rangeRound([0, dims.width]);
          this.scales.y.rangeRound([dims.height, 0]);

          const commitMarkers = this.props.highlightedCommits.map((c, i) => {
            // for each commit marker, we need to recalculate the correct
            // y-coordinate by checking where that commit would go in our
            // commit data points
            const j = _.sortedIndexBy(this.props.commits, c, other => other.date.getTime());

            const cBefore = this.props.commits[j - 1];
            const cAfter = this.props.commits[j];
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
                <g clipPath="url(#chart)" className={cx(styles.commitCount)}>
                  <StackedArea
                    data={this.props.commits}
                    series={this.state.commitSeries}
                    x={x}
                    y={y}
                    extractX={dateExtractor}
                    sum={_.sum}
                    fillToRight={today}
                  />
                  {commitMarkers}
                </g>
                {this.props.highlightedIssue &&
                  <defs>
                    <mask id="issue-mask">
                      <rect
                        x={0}
                        y={0}
                        width={dims.width}
                        height={dims.height}
                        style={{ stroke: 'none', fill: '#ffffff', opacity: 0.5 }}
                      />
                      <rect
                        x={x(this.props.highlightedIssue.createdAt)}
                        y={0}
                        width={Math.max(
                          3,
                          x(this.props.highlightedIssue.closedAt || new Date()) -
                            x(this.props.highlightedIssue.createdAt)
                        )}
                        height={dims.height}
                        style={{ stroke: 'none', fill: '#ffffff' }}
                      />
                    </mask>
                  </defs>}
                <g
                  clipPath="url(#chart)"
                  mask="url(#issue-mask)"
                  className={cx(styles.openIssuesCount)}>
                  <StackedArea
                    data={this.props.issues}
                    x={x}
                    y={y}
                    series={[
                      {
                        extractY: i => i.closedCount,
                        style: closedIssuesLegend.style,
                        className: styles.closedIssuesCount,
                        onMouseEnter: () => this.activateLegend(closedIssuesLegend),
                        onMouseLeave: () => this.activateLegend(null)
                      },
                      {
                        extractY: i => i.openCount,
                        style: openIssuesLegend.style,
                        onMouseEnter: () => this.activateLegend(openIssuesLegend),
                        onMouseLeave: () => this.activateLegend(null)
                      }
                    ]}
                    extractX={dateExtractor}
                    sum={_.sum}
                    fillToRight={today}
                  />
                </g>
                <g className={styles.today} clipPath="url(#x-only)">
                  <text x={today} y={-10}>
                    Now
                  </text>
                  <line x1={today} y1={0} x2={today} y2={dims.height} />
                </g>
              </OffsetGroup>
              <Legend
                x="10"
                y="10"
                categories={this.state.hoverHint ? [this.state.hoverHint] : legend}
              />
            </g>
          );
        }}
      </CustomZoomableChartContainer>
      // <ChartContainer>
      //   {dims => {
      //     this.scales.x.rangeRound([0, dims.width]);
      //     this.scales.y.rangeRound([dims.height, 0]);
      //     const translate = `translate(${dims.wMargin}, ${dims.hMargin})`;
      //     return (
      //       <CustomZoomableSvg
      //         x={this.scales.x}
      //         y={this.scales.y}
      //         scaleExtent={[1, Infinity]}
      //         onZoom={e => this.constrainZoom(e, dims, 50)}
      //         onStart={e =>
      //           this.setState({
      //             isPanning: e.sourceEvent == null || d3.event.sourceEvent.type !== 'wheel'
      //           })}
      //         onEnd={() => this.setState({ isPanning: false })}
      //         margin={10}
      //         className={cx(styles.chart, { [styles.panning]: this.state.isPanning })}>
      //         {({ x, y }) => {
      //         }}
      //       </CustomZoomableSvg>
      //     );
      //   }}
      // </ChartContainer>
    );
  }

  constrainZoom(t, dims, margin = 0) {
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

  activateLegend(legend) {
    this.setState({ hoverHint: legend });
  }

  extractCommitData(props) {
    if (!props.commits || props.commits.length === 0) {
      return {};
    }

    const lastCommitDataPoint = _.last(props.commits).statsByAuthor;
    const commitLegend = [];
    const commitSeries = _.map(lastCommitDataPoint, (committerIndex, signature) => {
      const legend = {
        name:
          (props.commitAttribute === 'count' ? 'Commits by ' : 'Changes by ') + signature ===
          'other'
            ? 'Others'
            : signature,
        style: {
          fill: props.palette[signature]
        }
      };

      commitLegend.push(legend);

      return {
        style: {
          fill: props.palette[signature]
        },
        extractY: d => {
          const stats = d.statsByAuthor[signature];
          if (props.commitAttribute === 'count') {
            return stats ? stats.count : 0;
          } else {
            return stats ? stats.changes / d.totals.changes * d.totals.count : 0;
          }
        },
        onMouseEnter: () => this.activateLegend(legend),
        onMouseLeave: () => this.activateLegend(null)
      };
    });

    return { commitSeries, commitLegend };
  }
}

const openIssuesLegend = {
  name: 'Open issues',
  style: {
    fill: '#ff9eb1',
    stroke: '#ff3860'
  }
};

const closedIssuesLegend = {
  name: 'Closed issues',
  style: {
    fill: '#73e79c'
  }
};
