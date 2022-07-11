'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const buildsState = state.visualizations.ciBuilds.state;
  return {
    builds: buildsState.data.data.builds,
    firstSignificantTimestamp: buildsState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: buildsState.data.data.lastSignificantTimestamp,
    chartResolution: buildsState.config.chartResolution,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
