'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">Issue Impact Help</h1>
    <p>
      This visualization aims to show the development "impact" caused by a specific issue in your
      ITS. Select an issue from the sidebar to begin.
    </p>
    <p>
      The horizontal axis in the middle of the circle represents the lifetime of the selected issue.
      It begins with its creation and ends when it is closed (or the current date if the issue is
      still open).
    </p>
    <h2>Upper semicircle: Files</h2>
    <p>
      The upper semicircle shows all files touched by commits referencing the selected issue. The
      length of the individual file-axes is determined by the maximum total length each file had in
      its lifetime.
    </p>
    <p>
      Each file-axis is connected to the central time-axis by commits which are represented by a
      collection of circle segments connecting the relevant hunks of the file that were changed on
      the file's axis to the point in time that the commit was made on the time-axis.
    </p>
    <p>Hunks belonging to the same commit share the same color.</p>
    <h2>Lower semicircle: Builds</h2>
    <p>
      On the lower semicircle axis of the visualization, CI builds are charted according to their
      run-lengths. Each build is segmented into its phases and color coded based on its status.
    </p>
    <h2>Sidebar</h2>
    <p>
      Use the search-box to choose an issue to visualize. When an issue is selected, more options
      become available.
    </p>
    <h3>Filters</h3>
    Use the provided filter boxes to exclude certain files or commits from the visualization in
    order to de-clutter the chart.
  </div>;
