'use strict';

import { connect } from 'react-redux';
import SidebarPanel from './SidebarPanel.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    visualizations: state.visualizations
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

const Sidebar = connect( mapStateToProps, mapDispatchToProps )( SidebarPanel );

export default Sidebar;
