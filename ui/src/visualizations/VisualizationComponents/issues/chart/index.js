'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const issuesState = state.visualizations.issues.state;
  return {
    palette: issuesState.data.data.palette,
    otherCount: issuesState.data.data.otherCount,
    issues: issuesState.data.data.issues,
    firstSignificantTimestamp: issuesState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: issuesState.data.data.lastSignificantTimestamp,
    chartResolution: issuesState.config.chartResolution,
    showIssues: issuesState.config.showIssues,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
