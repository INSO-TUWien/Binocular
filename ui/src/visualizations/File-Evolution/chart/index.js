'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const FileEvolutionState = state.visualizations.fileEvolution.state;
  console.log(FileEvolutionState);
  return {
    branches: FileEvolutionState.data.data.branches,
    committers: FileEvolutionState.data.data.committers,
    commits: FileEvolutionState.data.data.commits,
    authorsColorPalette: FileEvolutionState.data.data.authorsColorPalette,
    branchesColorPalette: FileEvolutionState.data.data.branchesColorPalette,
    selectedAuthors: FileEvolutionState.config.selectedAuthors,
    selectedBranches: FileEvolutionState.config.selectedBranches,
    commitBoxHeight: FileEvolutionState.config.commitBoxHeight,
    commitBoxWidth: FileEvolutionState.config.commitBoxWidth,
    commitBoxColor: FileEvolutionState.config.commitBoxColor,
    showCommitDate: FileEvolutionState.config.showCommitDate,
    showCommitAuthor: FileEvolutionState.config.showCommitAuthor,
    showCommitMessage: FileEvolutionState.config.showCommitMessage
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
