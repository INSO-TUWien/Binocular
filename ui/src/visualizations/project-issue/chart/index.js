'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const projectIssueState = state.visualizations.projectIssue.state;

  return {
    palette: projectIssueState.data.data.palette,
    otherCount: projectIssueState.data.data.otherCount,
    commits: projectIssueState.data.data.commits,
    committers: projectIssueState.data.data.committers,
    commitAttribute: projectIssueState.config.commitAttribute,
    issues: projectIssueState.data.data.issues,
    builds: projectIssueState.data.data.builds,
    firstSignificantTimestamp: projectIssueState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: projectIssueState.data.data.lastSignificantTimestamp,
    chartResolution: projectIssueState.config.chartResolution,
    showIssues: projectIssueState.config.showIssues,
    displayMetric: projectIssueState.config.displayMetric,
    selectedAuthors: projectIssueState.config.selectedAuthors,
    showCIChart: projectIssueState.config.showCIChart,
    showIssueChart: projectIssueState.config.showIssueChart,
    showChangesChart: projectIssueState.config.showChangesChart
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onCommitClick: function(c) {
      dispatch(openCommit(c));
    },
    onViewportChanged: function(v) {
      dispatch(setViewport(v));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
