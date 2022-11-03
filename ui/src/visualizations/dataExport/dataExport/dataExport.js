'use strict';

import React from 'react';
import styles from '../styles.scss';

export default class DataExport extends React.Component {
  constructor(props) {
    super(props);
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  render() {
    return <div className={styles.chartContainer}></div>;
  }
}
