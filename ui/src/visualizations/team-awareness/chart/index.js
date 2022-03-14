'use strict';

import { connect } from 'react-redux';
import { getState } from '../util/util.js';
import Chart from './chart.js';

const mapStateToProps = (appState /*, chartState */) => {
  const vizState = getState(appState);
  console.log(vizState);
  return {
    data: {
      stakeholders: vizState.data.data.stakeholders,
      activityTimeline: vizState.data.data.activityTimeline
    }
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
