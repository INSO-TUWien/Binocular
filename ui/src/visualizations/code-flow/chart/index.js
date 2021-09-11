'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const cfState = state.visualizations.codeFlow.state;

  return {
    refs: cfState.config.refs
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
