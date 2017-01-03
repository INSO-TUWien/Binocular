'use strict';

import { connect } from 'react-redux';
import Sidebar from './Sidebar.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    visualizations: state.visualizations
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect( mapStateToProps, mapDispatchToProps )( Sidebar );
