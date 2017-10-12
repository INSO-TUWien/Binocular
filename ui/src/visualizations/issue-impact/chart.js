'use strict';

import _ from 'lodash';
import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import cx from 'classnames';
import knapsack from 'knapsack-js';
import chroma from 'chroma-js';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

import Axis from '../code-ownership-river/Axis.js';
import hunkTransitions from './hunkTransitions.scss';
import Asterisk from '../../components/svg/Asterisk.js';
import X from '../../components/svg/X.js';

import { basename, parseTime, ClosingPathContext, getChartColors } from '../../utils';
import styles from './styles.scss';

const CHART_FILL_RATIO = 0.45;
const MINIMUM_SEMICIRCLE_SEPARATOR_SHARE = 0.2;
const MAXIMUM_SEMICIRCLE_FILE_SHARE = 1 - MINIMUM_SEMICIRCLE_SEPARATOR_SHARE;
const FILE_AXIS_DESCRIPTION_OFFSET = 10;

export default class IssueImpact extends React.Component {
  constructor(props) {
    super(props);

    const { commits, issue, files, totalLength, start, end, colors } = extractData(props);

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
      radius: 0,
      transform: d3.zoomIdentity,
      commits,
      colors,
      issue,
      files,
      start,
      end,
      totalLength,
      isPanning: false
    };
  }

  updateZoom(evt) {
    this.setState({ transform: evt.transform, dirty: true });
  }

  updateDimensions(dimensions) {
    const fullWidth = dimensions.width;
    const fullHeight = dimensions.height;
    const wPct = 0.8;
    const hPct = 0.8;

    const width = fullWidth * wPct;
    const height = fullHeight * hPct;
    const wMargin = (fullWidth - width) / 2;
    const hMargin = (fullHeight - height) / 2;

    this.setState({
      dimensions: {
        fullWidth,
        fullHeight,
        width,
        height,
        wMargin,
        hMargin
      },
      radius: Math.min(width, height) * CHART_FILL_RATIO
    });
  }

  componentWillReceiveProps(nextProps) {
    const { files, start, end, colors, issue } = extractData(nextProps);

    this.setState(
      {
        issue,
        colors,
        files,
        start,
        end
      },
      () => {
        if (!this.state.dirty) {
          this.resetZoom();
        }
      }
    );
  }

  renderFileAxes(issueScale, semi) {
    const radius = this.state.radius;
    const fullFileShare = MAXIMUM_SEMICIRCLE_FILE_SHARE * semi.scaleFactor;
    const fullSeparatorShare = 1 - fullFileShare;
    const separatorCount = semi.data.length + 1;
    const separatorShare = fullSeparatorShare / separatorCount;

    // start at one separator in
    let offsetShare = separatorShare;

    return semi.data.map(file => {
      const fileShare = file.length / semi.length * fullFileShare;

      if (fileShare === 0) {
        return <g />;
      }

      const spreadAngle = angleFromShare(fileShare) / 2;
      const startAngle = semi.offset + angleFromShare(offsetShare) / 2;
      const endAngle = semi.offset + angleFromShare(offsetShare + fileShare) / 2;
      let centerAngle = startAngle + spreadAngle / 2;
      const center = polarToCartesian(0, 0, radius + FILE_AXIS_DESCRIPTION_OFFSET, centerAngle);
      const textTranslate = `translate(${center.x}, ${-center.y})`;
      let textAnchor = 'start';

      if (centerAngle > Math.PI / 2 && centerAngle < Math.PI * 1.5) {
        centerAngle -= Math.PI;
        textAnchor = 'end';
      }

      const textRotate = `rotate(${rad2deg(-centerAngle)})`;

      const arcData = getArcData(0, 0, radius, endAngle, startAngle);

      const hunkMarkers = _.map(file.hunks, (hunk, i) => {
        const minLine = Math.min(hunk.oldStart, hunk.newStart);
        const maxLine = Math.max(hunk.oldStart + hunk.oldLines, hunk.newStart + hunk.newLines);
        const startShare = minLine / file.length;
        const endShare = maxLine / file.length;

        const startAngle = semi.offset + angleFromShare(offsetShare + fileShare * startShare) / 2;
        const endAngle = semi.offset + angleFromShare(offsetShare + fileShare * endShare) / 2;

        const start = polarToCartesian(0, 0, radius, startAngle);
        const end = polarToCartesian(0, 0, radius, endAngle);

        const lineX = issueScale(hunk.commit.date);

        const d = new ClosingPathContext();
        d.moveTo(start.x, -start.y);
        d.lineTo(lineX, 0);
        d.lineTo(end.x, -end.y);

        const closer = getArcData(0, 0, radius, startAngle, endAngle, true).reverse();
        d.closeToPath(closer, false);
        const color = this.state.colors[hunk.commit.sha];

        console.log('hunkTransitions:', hunkTransitions);
        return (
          <CSSTransition
            classNames={hunkTransitions}
            timeout={10000}
            key={`${hunk.commit.sha}-${file.path}-${i}`}>
            <g>
              <path
                className={styles.changeIndicator}
                d={d}
                style={{
                  fill: chroma(color).alpha(0.6).css(),
                  stroke: chroma(color).darken().hex()
                }}
              />
            </g>
          </CSSTransition>
        );
      });

      // the next segment should be drawn at the end of the current
      // segment + the separator
      offsetShare += fileShare + separatorShare;

      return (
        <g className={styles.fileAxis}>
          <TransitionGroup component="g">
            {hunkMarkers}
          </TransitionGroup>
          <path d={arcData} />
          <text transform={`${textTranslate} ${textRotate}`} style={{ textAnchor }}>
            {basename(file.name)}
          </text>
        </g>
      );
    });
  }

  render() {
    if (!this.state.issue) {
      return <svg />;
    }

    const dims = this.state.dimensions;
    const issueAxisLength = this.state.radius * 0.95;
    const issueScale = d3
      .scaleTime()
      .rangeRound([-issueAxisLength, issueAxisLength])
      .domain([this.state.start, this.state.end]);
    const translate = `translate(${dims.wMargin}, ${dims.hMargin})`;

    const fileAxes = [
      this.renderFileAxes(issueScale, this.state.files.top),
      this.renderFileAxes(issueScale, this.state.files.bottom)
    ];

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
                <circle
                  className={styles.circle}
                  r={this.state.radius}
                  cx={dims.width / 2}
                  cy={dims.height / 2}
                />
                <g transform={`translate(${dims.width / 2},${dims.height / 2})`}>
                  {fileAxes}
                  <g className={styles.issueAxis}>
                    <Axis orient="bottom" ticks={8} scale={issueScale} />
                    <g
                      className={styles.createMarker}
                      transform={`translate(${issueScale(this.state.issue.createdAt)}, -5)`}>
                      <Asterisk />
                    </g>
                    <g
                      className={styles.closeMarker}
                      transform={`translate(${issueScale(this.state.issue.closedAt)}, -5)`}>
                      <X />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>}
      </Measure>
    );
  }
}

function extractData(props) {
  if (!props.issue) {
    return {
      issue: null,
      colors: [],
      files: {
        totalLength: 0,
        top: [],
        bottom: []
      }
    };
  }

  let start = parseTime(props.issue.createdAt);
  let end = parseTime(props.issue.closedAt || new Date());

  const filesById = {};
  _.each(props.issue.commits.data, commit => {
    if (!_.includes(props.filteredCommits, commit.sha)) {
      return;
    }

    start = Math.min(parseTime(commit.date).getTime(), start);
    end = Math.max(parseTime(commit.date), end);
    _.each(commit.files.data, f => {
      if (!_.includes(props.filteredFiles, f.file.path)) {
        return;
      }

      if (!filesById[f.id]) {
        filesById[f.file.id] = {
          name: f.file.path,
          length: f.file.maxLength,
          hunks: f.hunks.map(h =>
            _.merge({}, h, {
              commit: {
                sha: commit.sha,
                date: parseTime(commit.date)
              }
            })
          )
        };
      }
    });
  });

  const colors = getChartColors('spectral', props.issue.commits.data.map(c => c.sha));

  // TODO somehow allow user to filter files
  const files = _.values(filesById).filter(f => f.name !== 'yarn.lock');

  const totalLength = _.sumBy(files, 'length');
  const bottomLength = Math.floor(totalLength / 2);

  const rucksack = _.map(files, (f, i) => ({ [i]: f.length }));
  const bottomIndexes = knapsack
    .resolve(bottomLength, rucksack)
    .map(obj => parseInt(_.keys(obj)[0], 10));

  let top = { data: [], length: 0, offset: 0 };
  let bottom = { data: [], length: 0, offset: Math.PI };

  _.each(files, (f, i) => {
    if (_.includes(bottomIndexes, i)) {
      bottom.data.push(f);
      bottom.length += f.length;
    } else {
      top.data.push(f);
      top.length += f.length;
    }
  });

  if (bottom.data.length > top.data.length) {
    let swap = bottom;
    bottom = top;
    top = swap;
  }

  const [smallerHalf, largerHalf] = _.sortBy([top, bottom], 'length');
  const sizeDifference = largerHalf.length - smallerHalf.length;

  largerHalf.scaleFactor = 1;
  smallerHalf.scaleFactor = smallerHalf.length / largerHalf.length;
  largerHalf.fullSeparatorShare = MINIMUM_SEMICIRCLE_SEPARATOR_SHARE;
  smallerHalf.fullSeparatorShare =
    MINIMUM_SEMICIRCLE_SEPARATOR_SHARE * (1 + sizeDifference / totalLength);

  return {
    issue: {
      createdAt: parseTime(props.issue.createdAt),
      closedAt: parseTime(props.issue.closedAt)
    },
    start: new Date(start),
    end: new Date(end),
    colors,
    files: {
      totalLength: top.length + bottom.length,
      top,
      bottom
    }
  };
}

function getArcData(cx, cy, r, startAngle, endAngle, sweep = false) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);

  const ctx = new ClosingPathContext();
  ctx.moveTo(start.x, -start.y);
  ctx.arcTo(r, r, 0, endAngle - startAngle > Math.PI, sweep, end.x, end.y);

  return ctx;
}

function polarToCartesian(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  };
}

function rad2deg(rad) {
  return rad / Math.PI * 180;
}

function angleFromShare(share) {
  return Math.PI * 2 * share;
}
