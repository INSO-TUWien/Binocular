'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';
import chroma from 'chroma-js';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

import GlobalZoomableSvg from '../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../components/svg/OffsetGroup.js';
import Axis from '../code-ownership-river/chart/Axis.js';
import hunkTransitions from './hunkTransitions.scss';
import Asterisk from '../../components/svg/Asterisk.js';
import X from '../../components/svg/X.js';
import ChartContainer from '../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../utils/zoom.js';
import SemiCircleScale from './SemiCircleScale.js';

import { parseTime, getChartColors, shortenPath } from '../../utils';
import styles from './styles.scss';

const CHART_FILL_RATIO = 0.45;
const MINIMUM_VACANT_SEMICIRCLE_SHARE = 0.2;
const MAXIMUM_OCCUPIED_SEMICIRCLE_SHARE = 1 - MINIMUM_VACANT_SEMICIRCLE_SHARE;
const AXIS_DESCRIPTION_OFFSET = 10;
const JOB_RING_WIDTH = 10;

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
    const { files, start, end, colors, issue, builds } = extractData(nextProps);

    this.setState({
      issue,
      colors,
      files,
      start,
      end,
      builds
    });
  }

  renderBuildAxis(issueScale, radius, builds) {
    const separatorCount = builds.data.length + 1;
    const separatorShare = MINIMUM_VACANT_SEMICIRCLE_SHARE / separatorCount;
    const semi = new SemiCircleScale(0, 0, radius, { offset: Math.PI });
    const outerJobSemi = semi.extrude(JOB_RING_WIDTH);
    const descriptionSemi = outerJobSemi.extrude(AXIS_DESCRIPTION_OFFSET);

    let offsetShare = separatorShare;

    return builds.data.map(build => {
      const buildShare = build.duration / builds.totalDuration * MAXIMUM_OCCUPIED_SEMICIRCLE_SHARE;
      const endShare = offsetShare + buildShare;

      const buildKey = build.id;
      if (buildShare === 0) {
        return <g key={build.id} />;
      }

      const arcData = semi.getArcForShares(offsetShare, endShare);

      const lineStart = issueScale(build.createdAt);
      const lineEnd = issueScale(build.finishedAt);
      const pie = semi.getPieForShares(offsetShare, endShare, lineStart, lineEnd);

      let jobOffsetShare = offsetShare;
      const jobs = build.jobs.map(job => {
        const jobShare = job.duration / build.duration * buildShare;

        const jobArc = semi.getArcForShares(jobOffsetShare, jobOffsetShare + jobShare);
        // const outerStart = outerJobSemi.getCoordsForShare(jobOffsetShare);
        const outerEnd = outerJobSemi.getCoordsForShare(jobOffsetShare + jobShare);
        jobArc.lineTo(outerEnd.x, -outerEnd.y);

        const outerJobArc = outerJobSemi.getArcForShares(
          jobOffsetShare + jobShare,
          jobOffsetShare,
          true
        );
        jobArc.concat(outerJobArc);
        const innerStart = semi.getCoordsForShare(jobOffsetShare);
        jobArc.lineTo(innerStart.x, -innerStart.y);

        const jobAnnotation = descriptionSemi.getAnnotationDataForShare(
          jobOffsetShare + jobShare / 2
        );

        jobOffsetShare += jobShare;

        return (
          <g key={job.id}>
            <text
              transform={jobAnnotation.transform}
              style={{ textAnchor: jobAnnotation.textAnchor }}>
              {job.name}
            </text>
            <path
              d={jobArc}
              className={cx(styles.job, styles.arc, styles[job.status])}
              onClick={() => this.props.onJobClick(job)}
            />
          </g>
        );
      });

      offsetShare += buildShare + separatorShare;

      return (
        <g key={buildKey} className={styles.buildAxis}>
          <path d={pie} className={styles.indicatorLine} />
          {jobs}
          <path d={arcData} className={cx(styles.arc, styles[build.status])} />
        </g>
      );
    });
  }

  renderFileAxis(issueScale, radius, files) {
    const separatorCount = files.data.length + 1;
    const separatorShare = MINIMUM_VACANT_SEMICIRCLE_SHARE / separatorCount;
    const semi = new SemiCircleScale(0, 0, radius);
    const annotationSemi = semi.extrude(AXIS_DESCRIPTION_OFFSET);

    // start at one separator in
    let offsetShare = separatorShare;

    return files.data.map((file, i) => {
      const fileShare = file.length / files.totalLength * MAXIMUM_OCCUPIED_SEMICIRCLE_SHARE;

      if (fileShare === 0) {
        return <g key={i} />;
      }

      // const textRotate = `rotate(${rad2deg(-centerAngle)})`;
      const annotation = annotationSemi.getAnnotationDataForShare(offsetShare + fileShare / 2);

      // const arcData = getArcData(0, 0, radius, endAngle, startAngle);
      const arcData = semi.getArcForShares(offsetShare, offsetShare + fileShare);

      const hunkMarkers = _.map(file.hunks, (hunk, i) => {
        const minLine = Math.min(hunk.oldStart, hunk.newStart);
        const maxLine = Math.max(hunk.oldStart + hunk.oldLines, hunk.newStart + hunk.newLines);
        const startShare = offsetShare + fileShare * (minLine / file.length);
        const endShare = offsetShare + fileShare * (maxLine / file.length);

        const lineX = issueScale(hunk.commit.date);

        const pie = semi.getPieForShares(startShare, endShare, lineX, lineX);
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
                d={pie}
                style={{
                  fill: isHighlighted ? dark : light,
                  stroke: dark
                }}
                onMouseEnter={() => this.setState({ hoveredHunk: hunkKey })}
                onMouseLeave={() => this.setState({ hoveredHunk: null })}
                onClick={() => this.props.onHunkClick(hunk)}
              />
            </g>
          </CSSTransition>
        );
      });

      // the next segment should be drawn at the end of the current
      // segment + the separator
      offsetShare += fileShare + separatorShare;

      return (
        <g className={styles.fileAxis} key={i}>
          <TransitionGroup component="g">
            {hunkMarkers}
          </TransitionGroup>
          <path d={arcData} />
          <text transform={annotation.transform} style={{ textAnchor: annotation.textAnchor }}>
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
    const buildAxis = this.renderBuildAxis(issueScale, radius, this.state.builds);

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
              <g className="file-axis">
                {fileAxis}
              </g>
              <g className="build-axis">
                {buildAxis}
              </g>
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
      },
      builds: {
        totalDuration: 0,
        data: []
      }
    };
  }

  let start = new Date(props.issue.createdAt);
  let end = props.issue.closedAt ? new Date(props.issue.closedAt) : new Date();

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
                date: parseTime(commit.date),
                webUrl: commit.webUrl
              }
            })
          )
        };
      }
    });

    _.each(commit.builds, b => {
      if (!b.finishedAt) {
        return;
      }

      let totalJobDuration = 0;
      const jobs = _(b.jobs)
        .filter(job => !job.finishedAt)
        .map(job => {
          const startedAt = parseTime(job.createdAt);
          const finishedAt = parseTime(job.finishedAt || job.createdAt);
          const duration = (finishedAt.getTime() - startedAt.getTime()) / 1000;
          totalJobDuration += duration;
          return {
            id: job.id,
            name: job.name,
            stage: job.stage,
            status: job.status,
            webUrl: job.webUrl,
            startedAt,
            finishedAt,
            duration
          };
        })
        .value();

      buildsById[b.id] = _.assign({}, b, {
        createdAt: parseTime(b.createdAt),
        finishedAt: parseTime(b.finishedAt),
        jobs: _.map(jobs, job =>
          _.assign({}, job, {
            duration: job.duration / totalJobDuration * b.duration
          })
        )
      });
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
