'use strict';

import { connect } from 'react-redux';

import ProgressBar from './ProgressBar.js';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    progress: state.progress
  };
};

const mapDispatchToProps = (/*dispatch, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
