'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport } from '../../../legacy/dashboard/sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashState = state.visualizations.dashboard.state;

  return {
    builds: dashState.data.data.builds,
    firstSignificantTimestamp: dashState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: dashState.data.data.lastSignificantTimestamp,
    chartResolution: dashState.config.chartResolution,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
