'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state/*, ownProps*/) => {
  return {
    commits: state.commits
  };
};

const mapDispatchToProps = (/*dispatch, ownProps*/) => {
  return {};
};

export default connect( mapStateToProps, mapDispatchToProps )( Chart );
