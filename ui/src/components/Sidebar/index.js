'use strict';

import { connect } from 'react-redux';
import Sidebar from './Sidebar';
import { switchVisualization } from '../../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    visualizations: state.visualizations,
    activeVisualization: state.activeVisualization,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    switchVisualization: (id) => dispatch(switchVisualization(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
