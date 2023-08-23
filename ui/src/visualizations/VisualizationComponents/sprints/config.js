'use strict';

import { connect } from 'react-redux';
import { setColorIssuesMergeRequestsMostTimeSpent } from './sagas';
import styles from './styles.scss';
import React from 'react';

const mapStateToProps = (state /*, ownProps*/) => {
  const sprintsState = state.visualizations.sprints.state;
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return { onSetColorIssuesMergeRequestsMostTimeSpent: (value) => dispatch(setColorIssuesMergeRequestsMostTimeSpent(value)) };
};

const SprintsConfigComponent = (props) => {
  return (
    <div className={styles.configContainer}>
      <h2>Color Sprints and Merge Requests</h2>
      <div className="field">
        <input
          id="issueMergeRequestsColoringSwitch"
          type="checkbox"
          name="issueMergeRequestsColoringSwitch"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={props.colorIssuesMergeRequestsMostTimeSpent}
          onChange={(e) => props.onSetColorIssuesMergeRequestsMostTimeSpent(e.target.checked)}
        />
        <label htmlFor="issueMergeRequestsColoringSwitch" className={styles.switch}>
          Creator/Most Spent Time
        </label>
      </div>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(SprintsConfigComponent);

export default DashboardConfig;
