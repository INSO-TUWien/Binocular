'use strict';

import { connect } from 'react-redux';
import { getState } from '../util/util.js';
import Chart from './chart.js';

const mapStateToProps = (appState /*, chartState */) => {
  const vizState = getState(appState);
  return {
    data: {
      stakeholders: vizState.data.data.stakeholders,
      activity: vizState.data.data.activity
    }
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
