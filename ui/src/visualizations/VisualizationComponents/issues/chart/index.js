'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const issuesState = state.visualizations.issues.state;
  const universalSettings = state.visualizations.newDashboard.state.config;

  return {
    palette: issuesState.data.data.palette,
    otherCount: issuesState.data.data.otherCount,
    issues: issuesState.data.data.issues,
    firstSignificantTimestamp: issuesState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: issuesState.data.data.lastSignificantTimestamp,
    chartResolution: universalSettings.chartResolution,
    showIssues: issuesState.config.showIssues,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
