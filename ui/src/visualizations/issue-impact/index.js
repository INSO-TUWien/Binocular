'use strict';

import { connect } from 'react-redux';
import IssueImpact from './chart.js';

import { openCommit } from './sagas';

const mapStateToProps = state => {
  return {
    issue: state.issueImpactData.data.issue,
    filteredCommits: state.issueImpactConfig.filteredCommits,
    filteredFiles: state.issueImpactConfig.filteredFiles
  };
};

const mapDispatchToProps = dispatch => ({
  onHunkClick: hunk => dispatch(openCommit(hunk.commit))
});

export default connect(mapStateToProps, mapDispatchToProps)(IssueImpact);
