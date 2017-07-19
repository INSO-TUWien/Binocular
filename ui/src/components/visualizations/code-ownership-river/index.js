'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { showCommit } from '../../../sagas.js';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    commits: state.commits
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onCommitClick: function(c) {
      dispatch(showCommit(c));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
