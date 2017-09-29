'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { showCommit } from '../../../sagas';
import { setViewport } from '../../../sagas/CodeOwnershipRiver.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const cfg = state.codeOwnershipConfig;
  const issues = cfg.showIssues ? state.codeOwnershipData.data.issues : [];

  return {
    palette: state.codeOwnershipData.data.palette,
    commits: state.codeOwnershipData.data.commits,
    commitAttribute: state.codeOwnershipConfig.commitAttribute,
    issues,
    highlightedIssue: state.codeOwnershipConfig.highlightedIssue
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
