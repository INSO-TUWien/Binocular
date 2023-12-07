'use strict';

import React from 'react';

import styles from '../styles.module.scss';
import SprintChart from './sprintChart';

export default (props) => {
  return (
    <div className={styles.chartContainer} onClick={(event) => event.stopPropagation()}>
      <SprintChart
        sprints={props.sprints}
        issues={props.issues}
        mergeRequests={props.mergeRequests}
        mergedAuthors={props.mergedAuthors}
        colorIssuesMergeRequests={props.colorIssuesMergeRequests}
        size={props.size}
      />
    </div>
  );
};
