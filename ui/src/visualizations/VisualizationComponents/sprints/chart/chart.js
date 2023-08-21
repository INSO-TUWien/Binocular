'use strict';

import React from 'react';

import styles from '../styles.scss';
import SprintChart from './sprintChart';

export default (props) => {
  return (
    <div className={styles.chartContainer}>
      <SprintChart sprints={props.sprints} />
    </div>
  );
};
