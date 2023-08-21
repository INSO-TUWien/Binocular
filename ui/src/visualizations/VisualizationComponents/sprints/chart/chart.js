'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
import _ from 'lodash';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import chroma from 'chroma-js';

export default (props) => {
  return <div className={styles.chartContainer}>Sprints:{props.sprints.length}</div>;
};
