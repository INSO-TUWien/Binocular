'use strict';

import _ from 'lodash';
import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import cx from 'classnames';
import knapsack from 'knapsack-js';

import styles from './styles.scss';

const MINIMUM_SEMICIRCLE_SEPARATOR_SHARE = 0.2;
const MAXIMUM_SEMICIRCLE_FILE_SHARE = 1 - MINIMUM_SEMICIRCLE_SEPARATOR_SHARE;
const FILE_AXIS_DESCRIPTION_OFFSET = 15;

export default class IssueImpact extends React.Component {
  constructor(props) {
    super(props);

    const { commits, issue, files, totalLength } = extractData(props);

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
      issue,
      files,
      totalLength,
      isPanning: false
    };

    this.scales = {
      x: d3.scaleTime().rangeRound([0, 0]),
      y: d3.scaleLinear().rangeRound([0, 0])
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

  componentWillReceiveProps(nextProps) {
    console.log('willReceiveProps called!');
    const { files } = extractData(nextProps);

    this.setState(
      {
        files
      },
      () => {
        if (!this.state.dirty) {
          this.resetZoom();
        }
      }
    );
  }

  renderFileAxes(radius, semi) {
    // const fullSeparatorShare = MINIMUM_SEMICIRCLE_SEPARATOR_SHARE / semi.scaleFactor;
    // const fullFileShare = 1 - fullSeparatorShare;

    const fullFileShare = MAXIMUM_SEMICIRCLE_FILE_SHARE * semi.scaleFactor;
    const fullSeparatorShare = 1 - fullFileShare;
    const separatorCount = semi.data.length + 1;
    const separatorShare = fullSeparatorShare / separatorCount;

    // start at one separator in
    let offsetShare = separatorShare;

    return semi.data.map(file => {
      const fileShare = file.length / semi.length * fullFileShare;

      const spreadAngle = angleFromShare(fileShare) / 2;
      const startAngle = semi.offset + angleFromShare(offsetShare) / 2;
      const endAngle = semi.offset + angleFromShare(offsetShare + fileShare) / 2;
      const centerAngle = startAngle + spreadAngle / 2;
      const center = polarToCartesian(0, 0, radius + FILE_AXIS_DESCRIPTION_OFFSET, centerAngle);
      const textTranslate = `translate(${center.x}, ${-center.y})`;
      const textRotate = `rotate(${rad2deg(semi.offset + Math.PI / 2 - centerAngle)})`;

      const arc = renderArc(0, 0, radius, endAngle, startAngle);
      console.log(file);
      commi;

      const hunkMarkers = _.map(file.hunks, hunk => {
        const startShare = Math.min(hunk.oldStart, hunk.newStart) / file.length;
        const endShare =
          Math.max(hunk.oldStart + hunk.oldLines, hunk.newStart + hunk.newLines) / file.length;

        const startAngle = semi.offset + angleFromShare(offsetShare + fileShare * startShare) / 2;
        const endAngle = semi.offset + angleFromShare(offsetShare + fileShare * endShare) / 2;

        const start = polarToCartesian(0, 0, radius, startAngle);
        const end = polarToCartesian(0, 0, radius, endAngle);

        return (
          <g>
            <circle r="2" cx={start.x} cy={-start.y} />
            <circle r="4" cx={end.x} cy={-end.y} />
          </g>
        );
      });

      // the next segment should be drawn at the end of the current
      // segment + the separator
      offsetShare += fileShare + separatorShare;

      return (
        <g className={styles.fileAxis}>
          {arc}
          {hunkMarkers}
          <text transform={`${textTranslate} ${textRotate}`}>
            {file.name}
          </text>
        </g>
      );
    });
  }

  render() {
    console.log('render called:', this.state);
    if (!this.props.issue) {
      return <svg />;
    }

    const dims = this.state.dimensions;
    const radius = Math.min(dims.width, dims.height) / 1.9;
    const issueAxisLength = radius * 0.95;
    const translate = `translate(${dims.wMargin}, ${dims.hMargin})`;

    const fileAxes = [
      this.renderFileAxes(radius, this.state.files.top),
      this.renderFileAxes(radius, this.state.files.bottom)
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
                  r={radius}
                  cx={dims.width / 2}
                  cy={dims.height / 2}
                />
                <g transform={`translate(${dims.width / 2},${dims.height / 2})`}>
                  {fileAxes}
                  <line className={styles.issueAxis} x1={-issueAxisLength} x2={issueAxisLength} />
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
      files: {
        totalLength: 0,
        top: [],
        bottom: []
      }
    };
  }

  const filesById = {};
  _.each(props.issue.commits, c => {
    _.each(c.hunks, h => {
      if (!filesById[h.file.id]) {
        filesById[h.file.id] = {
          name: h.file.path,
          length: 0,
          hunks: []
        };
      }

      const file = filesById[h.file.id];
      file.hunks.push(h);

      file.length = _.max([file.length, h.oldStart + h.oldLines, h.newStart + h.newLines]);
    });
  });

  const files = _.values(filesById);

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
    issue: {},
    files: {
      totalLength: top.length + bottom.length,
      top,
      bottom
    }
  };
}

function renderArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);

  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
  const d = `M${start.x},${-start.y}A${r},${r},0,${largeArcFlag},0,${end.x},${-end.y}`;

  return <path d={d} />;
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
