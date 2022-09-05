'use strict';

import { connect } from 'react-redux';

import Graph from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const coChangeState = state.visualizations.coChangeGraph.state;
  //const universalSettings = state.visualizations.newDashboard.state.config;

  return {
    navigationMode: coChangeState.config.navigationMode,
    commitsFiles: coChangeState.data.data.commitsFiles,
    commitsModules: coChangeState.data.data.commitsModules,
    moduleData: coChangeState.data.data.moduleData
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Graph);
