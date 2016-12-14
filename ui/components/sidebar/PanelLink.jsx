'use strict';

import { connect } from 'react-redux';
import { switchVisualization } from '../../actions.jsx';
import Link from './Link.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    isActive: ownProps.visualization.id === state.activeVisualization,
    children: ownProps.visualization.label
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => dispatch( switchVisualization(ownProps.visualization.id) )
  };
};

const PanelLink = connect( mapStateToProps, mapDispatchToProps )( Link );

export default PanelLink;
