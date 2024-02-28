'use strict';

import cx from 'classnames';

import styles from '../../styles/styles.module.scss';

export default () => (
  <div className={cx('box', styles.help)}>
    <h1 className="title">Code Ownership Help</h1>
    <p>This chart shows the number of lines owned by each author (y-axis) over time (x-axis), starting with the first commit.</p>

    <h2>Interaction</h2>
    <p>
      <ul>
        <li>
          <i className="fa fa-crosshairs" /> Select an area of the chart to zoom.
        </li>
        <li>
          <i className="fa fa-hand-pointer" /> Doubleclick to reset the viewport.
        </li>
        <li>
          <i className="fa fa-arrow-pointer" /> Hover over an area of the chart to see the amount of lines owned for an author.
        </li>
      </ul>
    </p>

    <h2>Sidebar</h2>
    <p>
      <ul>
        <li>Use the sidebar to select branches, (de)select authors and files, and select a timespan for the visualization.</li>
        <li>
          You can switch between absolute and relative mode.
          <ul>
            <li>
              <i className="fa fa-bars" /> Absolute: Show the absolute number of lines each author ownes at a specific time.
            </li>
            <li>
              <i className="fa fa-percent" /> Relative: Show the relative ownership of each author compared to the other selected authors.
            </li>
          </ul>
        </li>
      </ul>
    </p>

    <h2>Tips</h2>
    <p>
      Since projects may contain large auto-generated files (like package-lock.json) that may drastically influence ownership, it is advised
      to deselect these files.
    </p>
  </div>
);
