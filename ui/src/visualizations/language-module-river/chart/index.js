'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const languageModuleRiverState = state.visualizations.languageModuleRiver.state;

  return {
    attributes: languageModuleRiverState.data.data.attributes,
    languages: languageModuleRiverState.data.data.languages,
    modules: languageModuleRiverState.data.data.modules,
    palette: languageModuleRiverState.data.data.palette,
    commits: languageModuleRiverState.data.data.commits,
    committers: languageModuleRiverState.data.data.committers,
    commitAttribute: languageModuleRiverState.config.commitAttribute,
    issues: languageModuleRiverState.data.data.issues,
    builds: languageModuleRiverState.data.data.builds,
    firstSignificantTimestamp: languageModuleRiverState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: languageModuleRiverState.data.data.lastSignificantTimestamp,
    chartResolution: languageModuleRiverState.config.chartResolution,
    chartAttribute: languageModuleRiverState.config.chartAttribute,
    showIssues: languageModuleRiverState.config.showIssues,
    selectedAuthors: languageModuleRiverState.config.selectedAuthors,
    selectedLanguages: languageModuleRiverState.config.selectedLanguages,
    selectedModules: languageModuleRiverState.config.selectedModules,
    showCIChart: languageModuleRiverState.config.showCIChart,
    showIssueChart: languageModuleRiverState.config.showIssueChart
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onViewportChanged: function(v) {
      dispatch(setViewport(v));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
