'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport, openCommit } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeOwnershipRiver.state;
  const universalSettings = state.visualizations.newDashboard.state.config;
  const filteredIssues = corState.config.overlay === 'issues' ? corState.data.data.filteredIssues : [];
  const filteredBuilds = corState.config.overlay === 'builds' ? corState.data.data.filteredBuilds : [];
  const issues = corState.config.overlay === 'issues' ? corState.data.data.issues : [];
  const builds = corState.config.overlay === 'builds' ? corState.data.data.builds : [];

  return {
    palette: universalSettings.allAuthors,
    otherCount: corState.data.data.otherCount,
    filteredCommits: corState.data.data.filteredCommits,
    commits: corState.data.data.commits,
    commitAttribute: corState.config.commitAttribute,
    filteredIssues,
    issues,
    filteredBuilds,
    builds,
    highlightedIssue: corState.config.highlightedIssue,
    highlightedCommits: corState.config.highlightedCommits,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    mergedAuthors: universalSettings.mergedAuthors,
    otherAuthors: universalSettings.otherAuthors,
    allAuthors: universalSettings.allAuthors,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onCommitClick: function (c) {
      dispatch(openCommit(c));
    },
    onViewportChanged: function (v) {
      dispatch(setViewport(v));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
