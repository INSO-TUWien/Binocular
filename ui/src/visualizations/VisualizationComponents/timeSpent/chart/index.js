'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const timeSpentState = state.visualizations.timeSpent.state;
  const universalSettings = state.universalSettings;
  return {
    otherCount: timeSpentState.data.data.otherCount,
    filteredIssues: timeSpentState.data.data.filteredIssues,
    issues: timeSpentState.data.data.issues,
    firstIssueTimestamp: timeSpentState.data.data.firstIssueTimestamp,
    lastIssueTimestamp: timeSpentState.data.data.lastIssueTimestamp,
    firstSignificantTimestamp: timeSpentState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: timeSpentState.data.data.lastSignificantTimestamp,
    chartResolution: universalSettings.chartResolution,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    allAuthors: universalSettings.allAuthors,
    mergedAuthors: universalSettings.mergedAuthors,
    aggregateTime: timeSpentState.config.aggregateTime,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
