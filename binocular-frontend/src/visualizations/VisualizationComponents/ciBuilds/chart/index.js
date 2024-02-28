'use strict';

import { connect } from 'react-redux';

import Chart from './chart';

const mapStateToProps = (state /*, ownProps*/) => {
  const buildsState = state.visualizations.ciBuilds.state;
  const universalSettings = state.universalSettings;

  return {
    filteredBuilds: buildsState.data.data.filteredBuilds,
    builds: buildsState.data.data.builds,
    firstCommitTimestamp: buildsState.data.data.firstCommitTimestamp,
    lastCommitTimestamp: buildsState.data.data.lastCommitTimestamp,
    firstSignificantTimestamp: buildsState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: buildsState.data.data.lastSignificantTimestamp,
    chartResolution: universalSettings.chartResolution,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    allAuthors: universalSettings.allAuthors,
    excludedCommits: universalSettings.excludedCommits,
    excludeCommits: universalSettings.excludeCommits,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
