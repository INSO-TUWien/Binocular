'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { showCommit } from '../../../sagas';
import { setViewport } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeOwnershipRiver.state;

  const issues = corState.config.overlay === 'issues' ? corState.data.data.issues : [];
  const builds = corState.config.overlay === 'builds' ? corState.data.data.builds : [];

  return {
    palette: corState.data.data.palette,
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
      dispatch(showCommit(c));
    },
    onViewportChanged: function(v) {
      dispatch(setViewport(v));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
