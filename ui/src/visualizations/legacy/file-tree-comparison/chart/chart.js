'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
import _ from 'lodash';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import chroma from 'chroma-js';

export default class Changes extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    return(
      <table className={styles.tableGeneral}>
        <thead>
        <tr className={styles.headerCommits}>
          <td>Commit 1</td>
          <td className={styles.tdLine}>Commit 2</td>
        </tr>
        </thead>
        <tbody>
        <tr className={styles.tableContent}>
          <td>Test2</td>
          <td className={styles.tdLine}>Test3</td>
        </tr>
        </tbody>
      </table>
    );
  }
}
