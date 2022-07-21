'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const issuesState = state.visualizations.issues.state;
  const universalSettings = state.visualizations.newDashboard.state.config;

  return {
    palette: issuesState.data.data.palette,
    otherCount: issuesState.data.data.otherCount,
    filteredIssues: issuesState.data.data.filteredIssues,
    issues: issuesState.data.data.issues,
    firstCommitTimestamp: issuesState.data.data.firstCommitTimestamp,
    lastCommitTimestamp: issuesState.data.data.lastCommitTimestamp,
    firstSignificantTimestamp: issuesState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: issuesState.data.data.lastSignificantTimestamp,
    chartResolution: universalSettings.chartResolution,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    allAuthors: universalSettings.allAuthors,
    showIssues: issuesState.config.showIssues,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
