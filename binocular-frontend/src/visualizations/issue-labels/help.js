'use strict';

import cx from 'classnames';

import styles from '../../styles/styles.module.scss';

export default () => (
  <div className={cx('box', styles.help)}>
    <h1 className="title">Issue Labels Help</h1>
    <p>
      This visualization shows the code changes (additions and deletions) over time for issues with specific labels. It helps you understand
      the development activity and impact of different types of issues in your project.
    </p>

    <h2>Chart Features</h2>
    <p>
      <ul>
        <li>
          <i className="fa fa-plus" /> Additions
          <ul>
            <li>The green area shows the number of lines added over time</li>
            <li>Hover over the chart to see exact numbers for specific dates</li>
          </ul>
        </li>
        <li>
          <i className="fa fa-minus" /> Deletions
          <ul>
            <li>The red area shows the number of lines deleted over time</li>
            <li>The stacked areas help visualize the total code changes</li>
          </ul>
        </li>
        <li>
          <i className="fa fa-calendar" /> Timeline
          <ul>
            <li>The x-axis shows the timeline of changes</li>
            <li>The y-axis shows the number of lines changed</li>
          </ul>
        </li>
      </ul>
    </p>

    <h2>Interaction</h2>
    <p>
      <ul>
        <li>
          <i className="fa fa-mouse-pointer" /> Hover over the chart to see detailed information about code changes
        </li>
        <li>
          <i className="fa fa-search" /> Use the tooltip to see exact numbers for specific dates
        </li>
      </ul>
    </p>

    <h2>Configuration Panel</h2>
    <p>
      The configuration panel allows you to customize the visualization:
      <ol>
        <li>Select a branch to analyze</li>
        <li>Choose one or more issue labels to visualize</li>
        <li>Set the time period for the analysis</li>
      </ol>
    </p>

    <h2>Tips</h2>
    <p>
      <ul>
        <li>Use the label selector to focus on specific types of issues</li>
        <li>Compare different time periods to track progress</li>
        <li>Look for patterns in code changes to identify areas of high activity</li>
        <li>Use the tooltips to get exact numbers for specific dates</li>
      </ul>
    </p>
  </div>
);
