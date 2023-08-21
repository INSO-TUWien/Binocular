'use strict';

import { connect } from 'react-redux';
import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const sprintsState = state.visualizations.sprints.state;
  const universalSettings = state.universalSettings;
  return {
    filteredIssues: sprintsState.data.data.filteredCommits,
    issues: sprintsState.data.data.commits,
    firstCommitTimestamp: sprintsState.data.data.firstCommitTimestamp,
    lastCommitTimestamp: sprintsState.data.data.lastCommitTimestamp,
    firstSignificantTimestamp: sprintsState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: sprintsState.data.data.lastSignificantTimestamp,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    otherAuthors: universalSettings.otherAuthors,
    mergedAuthors: universalSettings.mergedAuthors,
    chartResolution: universalSettings.chartResolution,
    sprints: universalSettings.sprints,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
