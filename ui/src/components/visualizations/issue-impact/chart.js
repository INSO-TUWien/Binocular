'use strict';

import _ from 'lodash';
import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import cx from 'classnames';

import styles from './styles.scss';

const TOTAL_SEPARATOR_SHARE = 0.2;
const TOTAL_FILE_SHARE = 1 - TOTAL_SEPARATOR_SHARE;

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
    const { commits, issue, files, totalLength } = extractData(nextProps);

    this.setState(
      {
        commits,
        issue,
        files,
        totalLength
      },
      () => {
        if (!this.state.dirty) {
          this.resetZoom();
        }
      }
    );
  }

  renderFileAxes(radius, files, half = 'top') {
    const semicircleOffset = { top: 0, bottom: Math.PI }[half];

    const separatorCount = files.length + 1;
    const separatorShare = TOTAL_SEPARATOR_SHARE / separatorCount;

    let offset = separatorShare;
    return files.map(file => {
      const length = file.length / this.state.totalLength * TOTAL_FILE_SHARE * 2;

      const startAngle = (1 - offset) * Math.PI + semicircleOffset;
      const endAngle = (1 - (offset + length)) * Math.PI + semicircleOffset;

      const start = {
        x: Math.cos(startAngle) * radius,
        y: -Math.sin(startAngle) * radius
      };
      const end = {
        x: Math.cos(endAngle) * radius,
        y: -Math.sin(endAngle) * radius
      };

      console.log('start', start);
      console.log('end', end);

      const textAngleDeg = Math.atan2(start.x - end.x, start.y - end.y) / Math.PI * 360;
      console.log('textAngleDeg:', textAngleDeg);

      offset += length + separatorShare;
      const textTranslate = `translate(${(start.x + end.x) / 2},${(start.y + end.y) / 2})`;
      const textRotate = `rotate(${textAngleDeg})`;

      return (
        <g className={styles.fileAxis}>
          <circle r="5" cx={start.x} cy={start.y} />
          <text transform={`${textTranslate} ${textRotate}`}>text here</text>
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
        </g>
      );
    });
  }

  render() {
    if (!this.state.issue) {
      return <svg />;
    }

    const dims = this.state.dimensions;
    const radius = dims.width / 4;
    const issueAxisLength = radius * 0.95;
    const translate = `translate(${dims.wMargin}, ${dims.hMargin})`;

    const topFileCount = Math.ceil(this.state.files.length / 2);
    const bottomFileCount = this.state.files.length - topFileCount;
    const topFiles = _.take(this.state.files, topFileCount);
    const bottomFiles = _.take(this.state.files, bottomFileCount);
    const fileAxes = [
      this.renderFileAxes(radius, topFiles),
      this.renderFileAxes(radius, bottomFiles, 'bottom')
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
  const files = [
    { length: 600 },
    { length: 300 },
    { length: 100 },
    { length: 1000 },
    { length: 400 }
  ];
  return {
    issue: {},
    files,
    totalLength: _.sumBy(files, 'length')
  };
}
