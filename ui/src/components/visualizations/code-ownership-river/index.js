'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { showCommit } from '../../../sagas.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const cfg = state.codeOwnershipConfig;
  const issues = cfg.showIssues ? state.codeOwnershipData.data.issues : [];

  return {
    commits: state.codeOwnershipData.data.commits,
    issues
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onCommitClick: function(c) {
      dispatch(showCommit(c));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
