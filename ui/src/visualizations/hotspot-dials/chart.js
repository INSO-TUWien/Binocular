'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';
import ClockScale from './ClockScale.js';
import ClosingPathContext from '../../utils/ClosingPathContext.js';

import GlobalZoomableSvg from '../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../components/svg/OffsetGroup.js';
import ChartContainer from '../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../utils/zoom.js';
import { getChartColors } from '../../utils';

import styles from './styles.scss';

const CHART_FILL_RATIO = 0.65;
const MAXIMUM_FILL_RATE = 0.9;
const MINIMUM_FILL_RATE = 0.3;

export default class IssueImpact extends React.PureComponent {
  constructor(props) {
    super(props);

    this.elems = {};
    this.state = {
      transform: d3.zoomIdentity,
      dimensions: zoomUtils.initialDimensions()
    };

    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
  }

  componentWillReceiveProps(nextProps) {}

  render() {
    if (!this.props.categories || this.props.categories.length === 0 || this.props.maximum === 0) {
      return <svg />;
    }

    console.log('rendering with', this.props);

    const dims = this.state.dimensions;
    const radius = Math.min(dims.width, dims.height) * CHART_FILL_RATIO;
    const center = {
      x: dims.width / 2,
      y: dims.height / 2
    };

    const scale = d3
      .scaleLinear()
      .domain([0, this.props.maximum])
      .range([MINIMUM_FILL_RATE, MAXIMUM_FILL_RATE]);
    const clock = new ClockScale(0, 0, radius);

    // const start = clock.getCoordsForShare(0, 0.7);

    const dataPoints = [];
    const slices = [];
    const points = this.props.categories.map(cat => {
      const coords = clock.getCoordsForShare(
        cat.category / this.props.categories.length,
        scale(cat.count)
      );

      const textCoords = clock.getCoordsForShare(
        cat.category / this.props.categories.length,
        MINIMUM_FILL_RATE * 1.15
      );

      dataPoints.push(
        <g>
          <circle r="3" cx={coords.x} cy={coords.y} />
          <text x={textCoords.x} y={textCoords.y}>
            {cat.count}
          </text>
        </g>
      );

      return coords;
    });

    const curvePath = new ClosingPathContext();
    curvePath.smoothCurve(points, { smoothness: 0.5, close: true });

    const tickMarks = this.props.categories.map((cat, i) => {
      const textShare = i / this.props.categories.length;
      const tickShare = textShare + 1 / (2 * this.props.categories.length);

      const textCoords = clock.getCoordsForShare(textShare, 1.05);
      const insetCoords = clock.getCoordsForShare(tickShare, MINIMUM_FILL_RATE);
      const faceCoords = clock.getCoordsForShare(tickShare);

      const slice = new ClosingPathContext();
      slice.moveTo(0, 0);
      const topLeft = clock.getCoordsForShare(tickShare, 2);
      const topRight = clock.getCoordsForShare(tickShare + 1 / this.props.categories.length, 1.1);
      slice.lineTo(topLeft.x, topLeft.y);
      slice.lineTo(topRight.x, topRight.y);
      slice.lineTo(0, 0);
      slices.push(slice);

      return (
        <g>
          <line x1={faceCoords.x} y1={faceCoords.y} x2={insetCoords.x} y2={insetCoords.y} />
          <text x={textCoords.x} y={textCoords.y}>
            {cat.label}
          </text>
        </g>
      );
    });

    const palette = getChartColors('spectral', _.range(0, this.props.categories.length));
    console.log(palette);
    const segments = slices.map((s, i) =>
      <path d={s} className={styles.segment} style={{ fill: palette[i] }} clipPath="url(#curve)" />
    );

    return (
      <ChartContainer onResize={evt => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={evt => this.onZoom(evt)}
          transform={this.state.transform}>
          <OffsetGroup dims={dims} transform={this.state.transform}>
            <g className={styles.clockFace} transform={`translate(${center.x}, ${center.y})`}>
              <defs>
                <clipPath id="clock">
                  <circle r={radius} cx="0" cy="0" opacity="0.5" />
                </clipPath>
                <clipPath id="curve">
                  <path d={curvePath} className={styles.curve} />
                </clipPath>
              </defs>
              <circle r={radius} cx="0" cy="0" />
              <g className={styles.ticks}>
                {tickMarks}
                {segments}
                <path d={curvePath} className={styles.curve} />
                {dataPoints}
              </g>
              <circle className={styles.innerDial} r={radius * MINIMUM_FILL_RATE} cx="0" cy="0" />
            </g>
          </OffsetGroup>
        </GlobalZoomableSvg>
      </ChartContainer>
    );
  }
}
