'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashState = state.visualizations.dashboard.state;
  return {
    palette: dashState.data.data.palette,
    otherCount: dashState.data.data.otherCount,
    issues: dashState.data.data.issues,
    firstSignificantTimestamp: dashState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: dashState.data.data.lastSignificantTimestamp,
    chartResolution: dashState.config.chartResolution,
    showIssues: dashState.config.showIssues,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
