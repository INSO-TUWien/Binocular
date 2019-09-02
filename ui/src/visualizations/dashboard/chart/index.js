'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashState = state.visualizations.dashboard.state;

  return {
    palette: dashState.data.data.palette,
    otherCount: dashState.data.data.otherCount,
    commits: dashState.data.data.commits,
    commitAttribute: dashState.config.commitAttribute,
    issues: dashState.data.data.issues,
    builds: dashState.data.data.builds,
    firstSignificantTimestamp: dashState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: dashState.data.data.lastSignificantTimestamp,
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
