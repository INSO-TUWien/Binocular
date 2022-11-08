'use strict';

import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import GlobalZoomableSvg from '../../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import ChartContainer from '../../../components/svg/ChartContainer.js';
import Legend from '../../../components/Legend';
import * as zoomUtils from '../../../utils/zoom.js';
import { getChartColors } from '../../../utils';
import Dial from './Dial.js';
import DoubleDial from './DoubleDial.js';

import styles from './styles.scss';

const CHART_FILL_RATIO = 0.65;
const ISSUE_RATIO = 0.6;
const SPACER_RATIO = 0.3;

export default class HotspotDials extends React.PureComponent {
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

  render() {
    const dims = this.state.dimensions;
    const radius = Math.min(dims.width, dims.height) * CHART_FILL_RATIO;
    const center = {
      x: dims.width / 2,
      y: dims.height / 2
    };

    const commitPalette = getChartColors('spectral', _.range(0, this.props.commits.categories.length));

    const issuePalette = getChartColors(['orange', 'red', 'brown'], _.range(0, this.props.commits.categories.length));

    const legend = [
      {
        name: 'Outer dial: Total number of commits made',
        subLegend: this.props.commits.categories.map((cat, i) => ({
          name: cat.detailedLabel,
          style: { fill: commitPalette[i] }
        }))
      },
      {
        name: 'Inner dial: Total number of issues',
        subLegend: this.props.commits.categories.map((cat, i) => ({
          name: cat.detailedLabel,
          style: { fill: issuePalette[i] }
        }))
      }
    ];

    const CommitDial = this.props.splitCommits ? DoubleDial : Dial;

    return (
      <ChartContainer onResize={evt => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={evt => this.onZoom(evt)}
          transform={this.state.transform}
          unzoomed={<Legend x="10" y="10" categories={legend} />}>
          <OffsetGroup dims={dims} transform={this.state.transform}>
            <g className={styles.clockFace} transform={`translate(${center.x}, ${center.y})`}>
              <CommitDial
                id="commits"
                className={styles.commits}
                radius={radius}
                minimumFillRate={ISSUE_RATIO}
                maximum={this.props.commits.maximum}
                categories={this.props.commits.categories}
                showLabels={true}
                palette={commitPalette}
                split={true}
              />
              <Dial
                id="isses"
                className={styles.issues}
                radius={radius * ISSUE_RATIO}
                minimumFillRate={SPACER_RATIO}
                maximum={this.props.issues.maximum}
                categories={this.props.issues.categories}
                palette={issuePalette}
                background="grey"
              />
            </g>
          </OffsetGroup>
        </GlobalZoomableSvg>
      </ChartContainer>
    );
  }
}
