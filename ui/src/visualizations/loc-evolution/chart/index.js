'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport, openCommit } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.locEvolution.state;

  const issues = corState.config.overlay === 'issues' ? corState.data.data.issues : [];
  const builds = corState.config.overlay === 'builds' ? corState.data.data.builds : [];

  return {
    palette: corState.data.data.palette,
    otherCount: corState.data.data.otherCount,
    commits: corState.data.data.commits,
    commitAttribute: corState.config.commitAttribute,
    issues,
    builds,
    highlightedIssue: corState.config.highlightedIssue,
    highlightedCommits: corState.config.highlightedCommits
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onCommitClick: function(c) {
      dispatch(openCommit(c));
    },
    onViewportChanged: function(v) {
      dispatch(setViewport(v));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
