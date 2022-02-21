'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const FileEvolutionState = state.visualizations.fileEvolution.state;
  console.log(FileEvolutionState);
  return {
    files: FileEvolutionState.data.data.files,
    branches: FileEvolutionState.data.data.branches,
    committers: FileEvolutionState.data.data.committers,
    commits: FileEvolutionState.data.data.commits,
    authorsColorPalette: FileEvolutionState.data.data.authorsColorPalette,
    branchesColorPalette: FileEvolutionState.data.data.branchesColorPalette,
    commitFiles: FileEvolutionState.data.data.commitFiles,
    selectedAuthors: FileEvolutionState.config.selectedAuthors,
    selectedBranches: FileEvolutionState.config.selectedBranches,
    commitBoxHeight: FileEvolutionState.config.commitBoxHeight,
    commitBoxWidth: FileEvolutionState.config.commitBoxWidth,
    commitBoxColor: FileEvolutionState.config.commitBoxColor,
    showCommitDate: FileEvolutionState.config.showCommitDate,
    showCommitAuthor: FileEvolutionState.config.showCommitAuthor,
    showCommitMessage: FileEvolutionState.config.showCommitMessage,
    showCommitWeblink: FileEvolutionState.config.showCommitWeblink,
    showCommitSha: FileEvolutionState.config.showCommitSha,
    showCommitFiles: FileEvolutionState.config.showCommitFiles
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
