'use strict';

import { connect } from 'react-redux';

import Dashboard from './dashboard.js';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashState = state.visualizations.newDashboard.state;
  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
