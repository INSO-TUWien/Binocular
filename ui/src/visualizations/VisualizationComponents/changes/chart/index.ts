'use strict';

import { connect } from 'react-redux';
import Chart from './chart';
import { GlobalState } from '../../../../types/globalTypes';

const mapStateToProps = (state: GlobalState) => {
  const changesState = state.visualizations.changes.state;
  const universalSettings = state.universalSettings;
  return {
    palette: changesState.data.data.palette,
    otherCount: changesState.data.data.otherCount,
    filteredCommits: changesState.data.data.filteredCommits,
    commits: changesState.data.data.commits,
    committers: changesState.data.data.committers,
    firstCommitTimestamp: changesState.data.data.firstCommitTimestamp,
    lastCommitTimestamp: changesState.data.data.lastCommitTimestamp,
    firstSignificantTimestamp: changesState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: changesState.data.data.lastSignificantTimestamp,
    displayMetric: changesState.config.displayMetric,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    otherAuthors: universalSettings.otherAuthors,
    mergedAuthors: universalSettings.mergedAuthors,
    chartResolution: universalSettings.chartResolution,
    excludeMergeCommits: universalSettings.excludeMergeCommits,
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
