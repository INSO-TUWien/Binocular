'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';
import knapsack from 'knapsack-js';
import chroma from 'chroma-js';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

import GlobalZoomableSvg from '../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../components/svg/OffsetGroup.js';
import Axis from '../code-ownership-river/Axis.js';
import hunkTransitions from './hunkTransitions.scss';
import Asterisk from '../../components/svg/Asterisk.js';
import X from '../../components/svg/X.js';
import ChartContainer from '../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../utils/zoom.js';

import { basename, parseTime, ClosingPathContext, getChartColors, shortenPath } from '../../utils';
import styles from './styles.scss';

const CHART_FILL_RATIO = 0.45;
const MINIMUM_SEMICIRCLE_SEPARATOR_SHARE = 0.2;
const MAXIMUM_SEMICIRCLE_FILE_SHARE = 1 - MINIMUM_SEMICIRCLE_SEPARATOR_SHARE;
const FILE_AXIS_DESCRIPTION_OFFSET = 10;

export default class IssueImpact extends React.PureComponent {
  constructor(props) {
    super(props);

    const { commits, issue, files, builds, totalLength, start, end, colors } = extractData(props);

    this.elems = {};
    this.state = {
      dirty: true,
      commits,
      colors,
      issue,
      files,
      start,
      end,
      builds,
      totalLength,
      isPanning: false,
      hoveredHunk: null,
      transform: d3.zoomIdentity,
      dimensions: zoomUtils.initialDimensions()
    };

    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }

  componentWillReceiveProps(nextProps) {
    const { files, start, end, colors, issue } = extractData(nextProps);

    this.setState({
      issue,
      colors,
      files,
      start,
      end
    });
  }

  renderBuildAxis(issueScale, radius, builds) {}

  renderFileAxis(issueScale, radius, files) {
    const fullFileShare = MAXIMUM_SEMICIRCLE_FILE_SHARE;
    const fullSeparatorShare = 1 - fullFileShare;
    const separatorCount = files.data.length + 1;
    const separatorShare = fullSeparatorShare / separatorCount;

    // start at one separator in
    let offsetShare = separatorShare;

    return files.data.map(file => {
      const fileShare = file.length / files.totalLength * fullFileShare;

      if (fileShare === 0) {
        return <g />;
      }

      const spreadAngle = angleFromShare(fileShare) / 2;
      const startAngle = angleFromShare(offsetShare) / 2;
      const endAngle = angleFromShare(offsetShare + fileShare) / 2;
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

        const startAngle = angleFromShare(offsetShare + fileShare * startShare) / 2;
        const endAngle = angleFromShare(offsetShare + fileShare * endShare) / 2;

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

        const hunkKey = `${hunk.commit.sha}-${file.name}-${i}`;
        const isHighlighted = hunkKey === this.state.hoveredHunk;
        const light = chroma(color).alpha(0.6).css();
        const dark = chroma(color).darken().hex();

        return (
          <CSSTransition classNames={hunkTransitions} timeout={10000} key={hunkKey}>
            <g key={hunkKey}>
              <path
                className={styles.changeIndicator}
                d={d}
                style={{
                  fill: isHighlighted ? dark : light,
                  stroke: dark
                }}
                onMouseEnter={() => this.setState({ hoveredHunk: hunkKey })}
                onMouseLeave={() => this.setState({ hoveredHunk: null })}
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
            {shortenPath(file.name, 30)}
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
    const radius = Math.min(dims.width, dims.height) * CHART_FILL_RATIO;
    const issueAxisLength = radius * 0.95;
    const issueScale = d3
      .scaleTime()
      .rangeRound([-issueAxisLength, issueAxisLength])
      .domain([this.state.start, this.state.end]);

    const fileAxis = this.renderFileAxis(issueScale, radius, this.state.files);
    console.log('rendering builds:', this.state.builds);

    return (
      <ChartContainer onResize={evt => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={evt => this.onZoom(evt)}
          transform={this.state.transform}>
          <defs>
            <clipPath id="chart">
              <rect x="0" y="0" width={dims.width} height={dims.height} />
            </clipPath>
            <clipPath id="x-only">
              <rect x="0" y={-dims.hMargin} width={dims.width} height={dims.fullHeight} />
            </clipPath>
          </defs>
          <OffsetGroup dims={dims} transform={this.state.transform}>
            <circle className={styles.circle} r={radius} cx={dims.width / 2} cy={dims.height / 2} />
            <g transform={`translate(${dims.width / 2},${dims.height / 2})`}>
              {fileAxis}
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
          </OffsetGroup>
        </GlobalZoomableSvg>
      </ChartContainer>
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
        data: []
      }
    };
  }

  let start = parseTime(props.issue.createdAt);
  let end = parseTime(props.issue.closedAt || new Date());

  const filesById = {};
  const buildsById = {};

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

    _.each(commit.builds, b => {
      buildsById[b.id] = b;
    });
  });

  const colors = getChartColors('spectral', props.issue.commits.data.map(c => c.sha));

  const files = _.values(filesById);
  const totalLength = _.sumBy(files, 'length');

  const builds = _.values(buildsById);
  const totalDuration = _.sumBy(builds, 'duration');

  return {
    issue: {
      createdAt: parseTime(props.issue.createdAt),
      closedAt: parseTime(props.issue.closedAt)
    },
    start: new Date(start),
    end: new Date(end),
    colors,
    files: {
      totalLength,
      data: files
    },
    builds: {
      totalDuration,
      data: builds
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
