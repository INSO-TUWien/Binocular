'use strict';

import React from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import { RiverData } from './RiverData';
import styles from './data-river-chart.component.scss';
import ScalableBaseChartComponent from '../ScalableBaseChart';

export class DataRiverChartComponent extends ScalableBaseChartComponent {
  constructor(props) {
    super(props, styles);
  }

  calculateChartData(data, order) {
    return super.calculateChartData(data, order);
  }
}

const createId = node => `${node.sha}-${node.attribute}`;

export default DataRiverChartComponent;
