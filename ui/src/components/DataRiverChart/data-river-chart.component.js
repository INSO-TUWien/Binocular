'use strict';

import React from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import { RiverData } from './RiverData';
import styles from './data-river-chart.component.scss';
import ScalableBaseChart from '../ScalableBaseChart';

export class DataRiverChartComponent extends ScalableBaseChart {
  constructor(props) {
    super(props, styles);
  }
}

const createId = node => `${node.sha}-${node.attribute}`;

export default DataRiverChartComponent;
