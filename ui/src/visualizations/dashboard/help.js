'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">Dashboard Help</h1>
    <h2>Interaction</h2>
    <ul>
      <li>
        <i className="fa fa-hand-rock"/> Click and drag (left-to-right) on a diagram to zoom in horizontally.
      </li>
      <li>
        <i className="fa fa-hand-pointer"/> Double-Click a diagram to reset the zoom level.
      </li>
      <li>
        <i className="fa fa-search"/> Scroll with the mouse to zoom in and out vertically.
      </li>
      <li>
        <i className="fa fa-mouse-pointer"/> Hover over chart data to show the closest data point.
      </li>
    </ul>

    <h2>Sidebar</h2>
    <ul>
      <li>
        <i className="fa fa-calendar"/> Change the chart resolution to change the size of time-buckets where data is
        aggregated.
      </li>
      <li>
        <i className="far fa-square"/> Tick or untick charts to show and hide them.
      </li>
      <li>
        <i className="fa fa-ticket-alt"/> Change the issues shown to display either all, only currently open or only
        currently closed issues.
      </li>
      <li>
        <i className="fa fa-ruler"/> Change the metric of the changes graph to either use number of lines changed
        or number of commits as the scale for the y-Axis.
      </li>
      <li>
        <i className="fa fa-filter"/> In the legend, you can filter the authors that are displayed in the changes graph. The
        checkbox on the top selects/deselects all authors.
      </li>
      <li>
        <i className="fa fa-sort"/> The legend is sorted by overall contribution to the project. The authors that contributed
        the most are on top. "Others" is an exception, they are always at the bottom.
      </li>
    </ul>
  </div>;
