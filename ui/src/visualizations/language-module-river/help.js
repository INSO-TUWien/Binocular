'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">LanguageModuleRiver Help</h1>
    <h2>Interaction</h2>
    <ul>
      <li>
        <i className="fa fa-hand-pointer" /> Double-Click a diagram to reset the zoom level.
      </li>
      <li>
        <i className="fa fa-search" /> Scroll with the mouse to zoom in and out vertically.
      </li>
      <li>
        <i className="fa fa-mouse-pointer" /> Hover over chart data to show the closest data point.
      </li>
      <li>
        <i className="fa fa-mouse-pointer" /> Hover over chart data to show the closest data point.
      </li>
      <li>
        <i className="fa fa-chart-line" /> The y flow of the graph per attribute and author describes the build trend rate. At first, each
        commit can hold zero to many builds with several states. The build weight is taking the most occurring status and divides it by the
        given maximum amount of builds referring to this commit. Then the algorithm calculates the amount of changes of the current commit
        divided through the maximum amount of changes in the provided chart and multiplies it with the calculated build rate of the given
        commit. After that the result is added to or subtracted from the previous build rate of the last commit depending on the most
        accurate build status of the current commit.
      </li>
      <li>
        <i className="fa fa-chart-area" /> The size of each data point in the y-axis represents the amount of changes of a commit.
      </li>
    </ul>

    <h2>Sidebar</h2>
    <ul>
      <li>
        <i className="fa fa-calendar" /> Change the chart resolution to change the size of time-buckets where data is aggregated.
      </li>
      <li>
        <i className="fa fa-ticket-alt" /> Change the issues shown to display either all, only currently open or only currently closed
        issues.
      </li>
      <li>
        <i className="fa fa-file-code" /> Change the data river chart and sidebar to handle language specific data.
      </li>
      <li>
        <i className="fa fa-folder-open" /> Change the data river chart and sidebar to handle module specific data.
      </li>
      <li>
        <i className="far fa-square" /> Tick or untick charts to show and hide them.
      </li>
      <li>
        <i className="fa fa-filter" /> In the legend, you can filter the authors that are displayed in the changes graph. The checkbox on
        the top selects/deselects all authors.
      </li>
      <li>
        <i className="fa fa-filter" /> In the legend, you can filter the attributes that are displayed in the changes graph. The checkbox on
        the top selects/deselects all attributes of a category.
      </li>
      <li>
        <i className="fa fa-sort" /> The legend is sorted by overall contribution to the project. The authors that contributed and the
        attributes that changes the most are on top. "Others" is an exception, they are always at the bottom.
      </li>
    </ul>
  </div>;
