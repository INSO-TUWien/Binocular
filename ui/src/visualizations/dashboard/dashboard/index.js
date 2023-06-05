'use strict';

import { connect } from 'react-redux';

import Dashboard from './dashboard.js';
import { setActiveVisualizations } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashState = state.visualizations.newDashboard.state;
  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return { setActiveVisualizations: (visualizations) => dispatch(setActiveVisualizations(visualizations)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
