'use strict';

import styles from './progress-bar.scss';

import Filler from './Filler.js';

const ProgressBar = props => {
  const commits = props.progress.commits;
  const issues = props.progress.issues;

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
};

export default ProgressBar;
