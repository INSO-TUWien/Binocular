'use strict';

import { connect } from 'react-redux';

import Chart from './chart';

const mapStateToProps = (state /*, ownProps*/) => {
  const issueBreakdownState = state.visualizations.issueBreakdown.state;
  const universalSettings = state.universalSettings;
  return {
    palette: issueBreakdownState.data.data.palette,
    otherCount: issueBreakdownState.data.data.otherCount,
    filteredIssues: issueBreakdownState.data.data.filteredIssues,
    issues: issueBreakdownState.data.data.issues,
    firstIssueTimestamp: issueBreakdownState.data.data.firstIssueTimestamp,
    lastIssueTimestamp: issueBreakdownState.data.data.lastIssueTimestamp,
    firstSignificantTimestamp: issueBreakdownState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: issueBreakdownState.data.data.lastSignificantTimestamp,
    chartResolution: universalSettings.chartResolution,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    allAuthors: universalSettings.allAuthors,
    showIssues: issueBreakdownState.config.showIssues,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
