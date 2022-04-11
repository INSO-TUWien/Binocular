'use strict';

import { connect } from 'react-redux';
import { getState } from '../util/util.js';
import Chart from './chart.js';

const mapStateToProps = (appState /*, chartState */) => {
  const { data } = getState(appState);

  console.log('chart', data);
  return {
    data: {
      stakeholders: data.data.stakeholders,
      activityTimeline: data.data.activityTimeline
    }
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
