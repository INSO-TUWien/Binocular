'use strict';

import { connect } from 'react-redux';
import _ from 'lodash';

import ProgressBar from './ProgressBar.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    progress: state.progress
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  };
};

export default connect( mapStateToProps, mapDispatchToProps )( ProgressBar );
