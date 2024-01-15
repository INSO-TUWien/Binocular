'use strict';

import { connect } from 'react-redux';
import { setColorIssuesMergeRequests } from './sagas';
import styles from './styles.module.scss';
import React from 'react';
import TabCombo from '../../../components/TabCombo';

const mapStateToProps = (state /*, ownProps*/) => {
  const sprintsState = state.visualizations.sprints.state;
  return { colorIssuesMergeRequests: sprintsState.config.colorIssuesMergeRequests };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return { onSetColorIssuesMergeRequests: (value) => dispatch(setColorIssuesMergeRequests(value)) };
};

const SprintsConfigComponent = (props) => {
  return (
    <div className={styles.configContainer}>
      <h2>Color Sprints and Merge Requests</h2>
      <TabCombo
        value={props.colorIssuesMergeRequests}
        options={[
          { label: 'Creator', value: 0 },
          { label: 'Assignee', value: 1 },
          { label: 'Most Spent Time', value: 2, hint: 'Gitlab Only' },
        ]}
        onChange={(newSelected) => props.onSetColorIssuesMergeRequests(newSelected)}
      />
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(SprintsConfigComponent);

export default DashboardConfig;
