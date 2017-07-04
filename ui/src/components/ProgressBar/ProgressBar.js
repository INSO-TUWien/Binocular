'use strict';

import cx from 'classnames';

import styles from './progress-bar.scss';

const ProgressBar = props => {
  const commits = props.progress.commits;
  const issues = props.progress.issues;
  const pieData = [commits, issues].filter(d => d.total !== 0);
  const shareCount = pieData.length;

  const ringRadius = 100 / (2 * Math.PI);

  let dashOffset = 0;
  const segments = pieData.map(function(d, i) {
    const share = Math.round(d.processed / d.total * 100 / shareCount);
    const rest = 100 - share;

    const segment = (
      <circle
        key={i}
        className={styles.segment}
        cx="21"
        cy="21"
        r={ringRadius}
        strokeDasharray={`${share} ${rest}`}
        strokeDashoffset={25 - dashOffset}
      />
    );

    dashOffset += share;

    return segment;
  });

  const total = pieData.reduce((t, d) => t + d.total, 0);
  const processed = pieData.reduce((t, d) => t + d.processed, 0);

  return (
    <div className={styles.hoverTarget}>
      <svg width="100%" height="100%" viewBox="0 0 42 42" className={styles.donut}>
        <circle className={styles.ring} cx="21" cy="21" r={ringRadius} />
        <g>
          {segments}
        </g>
        <text className={styles.text} x="21" y="21">
          {Math.round(processed / total * 100)}%
        </text>
        <g transform="translate(21 19)">
          <text className={cx(styles.text, styles.details)} x="0" y="0">
            <tspan x="0">{commits.processed}/{commits.total} Commits</tspan>
            <tspan x="0" dy="1.5em">{issues.processed}/{issues.total} Issues</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
};

export default ProgressBar;
