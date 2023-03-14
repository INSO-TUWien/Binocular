'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const languageModuleRiverState = state.visualizations.languageModuleRiver.state;

  return {
    attributes: languageModuleRiverState.data.data.attributes,
    languages: languageModuleRiverState.data.data.languages,
    modules: languageModuleRiverState.data.data.modules,
    commits: languageModuleRiverState.data.data.commits,
    committers: languageModuleRiverState.data.data.committers,
    issues: languageModuleRiverState.data.data.issues,
    builds: languageModuleRiverState.data.data.builds,
    firstSignificantTimestamp: languageModuleRiverState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: languageModuleRiverState.data.data.lastSignificantTimestamp,
    chartResolution: languageModuleRiverState.config.chartResolution,
    chartAttribute: languageModuleRiverState.config.chartAttribute,
    selectedAuthors: languageModuleRiverState.config.selectedAuthors,
    selectedLanguages: languageModuleRiverState.config.selectedLanguages,
    selectedModules: languageModuleRiverState.config.selectedModules,
    highlightedIssue: languageModuleRiverState.config.highlightedIssue,
    highlightedCommits: languageModuleRiverState.config.highlightedCommits,
  };
};

export default connect(mapStateToProps)(Chart);
