'use strict';

import { connect } from 'react-redux';
import Sidebar from './Sidebar.js';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    visualizations: state.visualizations,
    activeVisualization: state.activeVisualization
  };
};

const mapDispatchToProps = (/*dispatch, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
