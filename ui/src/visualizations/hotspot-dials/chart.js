'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';
import chroma from 'chroma-js';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import ClockScale from './ClockScale.js';

import GlobalZoomableSvg from '../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../components/svg/OffsetGroup.js';
import Axis from '../code-ownership-river/Axis.js';
import ChartContainer from '../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../utils/zoom.js';

import { parseTime, getChartColors, shortenPath } from '../../utils';
import styles from './styles.scss';

const CHART_FILL_RATIO = 0.65;
const MINIMUM_VACANT_SEMICIRCLE_SHARE = 0.2;
const MAXIMUM_OCCUPIED_SEMICIRCLE_SHARE = 1 - MINIMUM_VACANT_SEMICIRCLE_SHARE;
const AXIS_DESCRIPTION_OFFSET = 10;
const JOB_RING_WIDTH = 10;

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
    const dims = this.state.dimensions;
    const radius = Math.min(dims.width, dims.height) * CHART_FILL_RATIO;
    const center = {
      x: dims.width / 2,
      y: dims.height / 2
    };

    const clock = new ClockScale(0, 0, radius);

    const start = clock.getCoordsForShare(0, 0.7);

    const ticks = _.range(0, 12).map(n => ({ value: n, label: n === 0 ? '12' : n.toString() }));

    const tickMarks = ticks.map((tick, i) => {
      const tickShare = i / ticks.length;
      const faceCoords = clock.getCoordsForShare(tickShare);
      const insetCoords = clock.getCoordsForShare(tickShare, 0.95);
      const textCoords = clock.getCoordsForShare(tickShare, 1.05);
      return (
        <g>
          <line x1={faceCoords.x} y1={faceCoords.y} x2={insetCoords.x} y2={insetCoords.y} />
          <text x={textCoords.x} y={textCoords.y}>
            {tick.label}
          </text>
        </g>
      );
    });

    return (
      <ChartContainer onResize={evt => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={evt => this.onZoom(evt)}
          transform={this.state.transform}>
          <OffsetGroup dims={dims} transform={this.state.transform}>
            <g className={styles.clockFace} transform={`translate(${center.x}, ${center.y})`}>
              <circle r={radius} cx="0" cy="0" />
              <g className={styles.ticks}>
                {tickMarks}
              </g>
            </g>
          </OffsetGroup>
        </GlobalZoomableSvg>
      </ChartContainer>
    );
  }
}
