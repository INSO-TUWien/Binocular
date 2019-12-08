'use strict';

import React from 'react';
import * as d3 from 'd3';

import GlobalZoomableSvg from '../../components/svg/GlobalZoomableSvg.js';
import ChartContainer from '../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../utils/zoom.js';

import styles from './styles.scss';

export default class CodeCloneEvolution extends React.PureComponent {
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
    return (
      <ChartContainer onResize={evt => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={evt => this.onZoom(evt)}
          transform={this.state.transform}>
          abc
        </GlobalZoomableSvg>
      </ChartContainer>
    );
  }
}
