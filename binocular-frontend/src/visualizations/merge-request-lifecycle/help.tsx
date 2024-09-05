'use-strict';

import cx from 'classnames';
import styles from '../../styles/styles.module.scss';
import React from 'react';

export default class HelpComponent extends React.Component {
  render() {
    return (
      <div className={cx('box', styles.help)}>
        <h1>MergeRequest Lifecycle Help</h1>
        <p>This chart shows the amount of time it took for a MergeRequest from being opend to ending up closed or merged.</p>
        <h2>Interaction</h2>
        <p>Hovering over the respective bubble displays additional info</p>
        <p>
          <i className="fa fa-times" style={{ transform: 'rotate(45deg)' }} /> Select an area of the chart to zoom.
        </p>
        <h2>Grouping</h2>
        <ul>
          <li>
            <strong>Single:</strong> Each bubble corresponds to a single MergeRequest. The color depicts the state of the MergeRequest while
            the x-Axis depicts the amount of time it spent from open to being closed/merged.
          </li>
          <li>
            <strong>Category:</strong> Shows the amount of MergeRequest in each state.
          </li>
          <li>
            <strong>Cumulative:</strong> Groups identical values according to the granularity specified in Granularity tab.
          </li>
        </ul>
      </div>
    );
  }
}
