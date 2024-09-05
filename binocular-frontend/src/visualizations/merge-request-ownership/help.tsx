'use-strict';

import cx from 'classnames';
import styles from '../../styles/styles.module.scss';
import React from 'react';

export default class HelpComponent extends React.Component {
  render() {
    return (
      <div className={cx('box', styles.help)}>
        <h1>MergeRequest Ownership Help</h1>
        <p>This chart shows the amount of MergeRequests a user is assigned to as either an assignee or reviewer.</p>

        <h2>Interaction</h2>
        <p>Hovering over the respective bubble shows the login of the specified user.</p>

        <h2>Sidebar</h2>
        <ul>
          <li>
            <strong>Date Range:</strong> Select a Date Range which contains all the MergeRequests inside this range.
          </li>
          <li>
            <strong>Author Selection:</strong> Users which contributed to the projects show up in the author selection and can be filtered
            by checking the respective boxes.
          </li>
          <li>
            <strong>Category:</strong>
            <br></br> Assignees - how many MergeRequests the user is assigned to as assignee.
            <br></br> Reviewers - how many MergeRequests the user is assigned to as reviewer.
          </li>
          <li>
            <strong>Only Show Authors:</strong> Only display user which have contributed to the project.
          </li>
        </ul>
      </div>
    );
  }
}
