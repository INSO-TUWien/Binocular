'use strict';

import { connect } from 'react-redux';

import ProgressBar from './ProgressBar.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeOwnershipRiver.state;

  return {
    progress: state.progress,
    showWorkIndicator: corState.data.isFetching // TODO add others
  };
};

const mapDispatchToProps = (/*dispatch, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
