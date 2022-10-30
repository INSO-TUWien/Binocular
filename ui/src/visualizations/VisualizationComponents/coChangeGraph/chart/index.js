'use strict';

import { connect } from 'react-redux';

import Graph from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const coChangeState = state.visualizations.coChangeGraph.state;
  //const universalSettings = state.visualizations.newDashboard.state.config;

  return {
    commitsFiles: coChangeState.data.data.commitsFiles,
    commitsModules: coChangeState.data.data.commitsModules,
    moduleData: coChangeState.data.data.moduleData,
    pathFilter: coChangeState.data.data.pathFilter,
    lowerBounds: coChangeState.data.data.lowerBounds,
    entitySelection: coChangeState.data.data.entitySelection,
    showIntraModuleDeps: coChangeState.config.showIntraModuleDeps,
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Graph);
