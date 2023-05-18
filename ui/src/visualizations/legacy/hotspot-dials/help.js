'use strict';

import cx from 'classnames';

import styles from '../../../styles/styles.scss';

export default () => (
  <div className={cx('box', styles.help)}>
    <h1 className="title">Hotspot Dials Help</h1>
    <p>The Hotspot Dials visualization shows an overview of the work that's been done since the project started.</p>
    <p>
      Depending on the selected granularity, the visualization sorts commits and issues into time-buckets and graphs them along a clockwise
      around circular dials.
    </p>
    <h2>Outer dial: Commits</h2>
    <p>
      The outer dial shows the number of commits per time bucket. If the "Split commits into good and bad" option is checked in the sidebar,
      instead of showing a total count, the visualization will split commits into commits that have a successful CI-build associated with
      them ("good") and commits without a successful build ("bad").
    </p>
    <h2>Inner dial: Issues</h2>
    <p>The inner dial shows the number of issues per time bucket.</p>
    <h2>Sidebar</h2>
    <p>Use the granularity setting to adjust the size of the time-buckets to hours, weekdays or months.</p>
  </div>
);
