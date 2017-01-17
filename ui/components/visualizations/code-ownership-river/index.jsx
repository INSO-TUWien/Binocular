'use strict';

import { connect } from 'react-redux';
import _ from 'lodash';

import Chart from './chart.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    commits: state.commits
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect( mapStateToProps, mapDispatchToProps )( Chart );
