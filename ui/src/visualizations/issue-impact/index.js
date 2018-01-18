'use strict';

import { connect } from 'react-redux';
import IssueImpact from './chart.js';
import ConfigComponent from './config.js';
import HelpComponent from './help.js';
import saga, { openHunk, openJob, openFile } from './sagas';
import reducer from './reducers';

const mapStateToProps = state => {
  const iiState = state.visualizations.issueImpact.state;

  return {
    issue: iiState.data.data.issue,
    filteredCommits: iiState.config.filteredCommits,
    filteredFiles: iiState.config.filteredFiles
  };
};

const mapDispatchToProps = dispatch => ({
  onHunkClick: hunk => dispatch(openHunk(hunk)),
  onFileClick: file => dispatch(openFile(file)),
  onJobClick: job => dispatch(openJob(job))
});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(IssueImpact);

export default {
  id: 'issueImpact',
  label: 'Issue Impact',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent
};
