'use strict';

import { connect } from 'react-redux';
import IssueImpact from './chart.js';
import ConfigComponent from './config.js';
import saga, { openHunk, openJob } from './sagas';
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
  onJobClick: job => dispatch(openJob(job))
});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(IssueImpact);

export default {
  id: 'issueImpact',
  label: 'Issue Impact',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent
};
