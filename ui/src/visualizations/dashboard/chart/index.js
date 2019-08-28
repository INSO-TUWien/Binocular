'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashState = state.visualizations.dashboard.state;

  const issues = dashState.config.overlay === 'issues' ? dashState.data.data.issues : [];
  const builds = dashState.config.overlay === 'builds' ? dashState.data.data.builds : [];

  return {
    palette: dashState.data.data.palette,
    otherCount: dashState.data.data.otherCount,
    commits: dashState.data.data.commits,
    commitAttribute: dashState.config.commitAttribute,
    issues,
    builds,
    highlightedIssue: dashState.config.highlightedIssue,
    highlightedCommits: dashState.config.highlightedCommits
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
