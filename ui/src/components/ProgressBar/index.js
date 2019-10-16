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
    showWorkIndicator: (dashState.data.isFetching || corState.data.isFetching || hotState.data.isFetching || impactState.data.isFetching)
  };
};

const mapDispatchToProps = (/*dispatch, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
