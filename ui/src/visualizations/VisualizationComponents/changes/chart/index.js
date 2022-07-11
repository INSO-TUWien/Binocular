'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const changesState = state.visualizations.changes.state;

  return {
    palette: changesState.data.data.palette,
    otherCount: changesState.data.data.otherCount,
    commits: changesState.data.data.commits,
    committers: changesState.data.data.committers,
    commitAttribute: changesState.config.commitAttribute,
    firstSignificantTimestamp: changesState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: changesState.data.data.lastSignificantTimestamp,
    chartResolution: changesState.config.chartResolution,
    displayMetric: changesState.config.displayMetric,
    selectedAuthors: changesState.config.selectedAuthors,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
