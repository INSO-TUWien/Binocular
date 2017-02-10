'use strict';

import _ from 'lodash';
import React from 'react';
import Measure from 'react-measure';
import cx from 'classnames';
import * as d3 from 'd3';

import styles from './progress-bar.scss';

import Filler from './Filler.jsx';

class ProgressBar extends React.Component {

  constructor() {
    super();
  }

  render() {

    const commits = this.props.progress.commits;
    const issues = this.props.progress.issues;

    console.log( this.props.progress );

    return (
      <div className={styles.hoverTarget}>
        <div className={styles.barContainer}>
          <Filler share={0.5} progress={commits.processed / commits.total} />
          <Filler share={0.5} progress={issues.processed / issues.total} />
        </div>
        <div className={styles.info}>
          <b>Indexing progress:</b>
          <div>
            Commits: {commits.processed}/{commits.total}
          </div>
          <div>
            Issues: {issues.processed}/{issues.total}
          </div>
        </div>
      </div>
    );
  }
}

export default ProgressBar;
