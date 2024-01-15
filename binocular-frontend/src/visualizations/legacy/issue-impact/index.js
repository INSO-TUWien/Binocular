'use strict';

import { connect } from 'react-redux';
import IssueImpact from './chart';
import ConfigComponent from './config';
import HelpComponent from './help';
import saga, { openHunk, openJob, openFile, openCommit } from './sagas';
import reducer from './reducers';

const mapStateToProps = (state) => {
  const iiState = state.visualizations.issueImpact.state;
  return {
    filteredIssue: iiState.data.data[0].issue,
    issue: iiState.data.data[1].issue,
    filteredCommits: iiState.config.filteredCommits,
    filteredFiles: iiState.config.filteredFiles,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onHunkClick: (hunk) => dispatch(openHunk(hunk)),
  onFileClick: (file) => dispatch(openFile(file)),
  onJobClick: (job) => dispatch(openJob(job)),
  onCommitClick: (commit) => dispatch(openCommit(commit)),
});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(IssueImpact);

export default {
  id: 'issueImpact',
  label: 'Issue Impact',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};
