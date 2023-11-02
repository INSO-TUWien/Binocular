'use strict';

import { connect } from 'react-redux';

import ProgressBar from './ProgressBar.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashState = state.visualizations.dashboard.state;
  const corState = state.visualizations.codeOwnershipRiver.state;
  const hotState = state.visualizations.hotspotDials.state;
  const impactState = state.visualizations.issueImpact.state;

  return {
    progress: state.progress,
    showWorkIndicator:
      state.progress.commits.processed < state.progress.commits.total ||
      state.progress.issues.processed < state.progress.issues.total ||
      state.progress.builds.processed < state.progress.builds.total ||
      state.progress.languages.processed < state.progress.languages.total ||
      dashState.data.isFetching ||
      corState.data.isFetching ||
      hotState.data.isFetching ||
      impactState.data.isFetching,
    offlineMode: state.config.offlineMode,
  };
};

const mapDispatchToProps = (/*dispatch, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
