'use strict';

import React from 'react';
import styles from '../styles.module.scss';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visualizations: [],
      visualizationCount: 0,
      selectVisualization: false,
    };
  }

  render() {
    return <div className={styles.chartContainer}></div>;
  }
}
