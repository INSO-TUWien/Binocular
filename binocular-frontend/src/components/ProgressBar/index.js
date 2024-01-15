'use strict';

import { connect } from 'react-redux';

import ProgressBar from './ProgressBar';

const mapStateToProps = (state /*, ownProps*/) => {
  const impactState = state.visualizations.issueImpact.state;

  return {
    progress: state.progress,
    showWorkIndicator:
      state.progress.commits.processed < state.progress.commits.total ||
      state.progress.issues.processed < state.progress.issues.total ||
      state.progress.builds.processed < state.progress.builds.total ||
      impactState.data.isFetching,
    offlineMode: state.config.offlineMode,
  };
};

const mapDispatchToProps = (/*dispatch, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
