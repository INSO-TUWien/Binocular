'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state) => {
  const caState = state.visualizations.conflictAwareness.state;

  return {
    commits: caState.data.data.commits,
    branches: caState.data.data.branches,
    colorBaseProject: caState.config.color.baseProject,
    colorOtherProject: caState.config.color.otherProject,
    colorCombined: caState.config.color.combined,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
