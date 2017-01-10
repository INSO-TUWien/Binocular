'use strict';

import { connect } from 'react-redux';

import ConfigButton from './ConfigButton.jsx';
import { showConfig } from '../../actions.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    spinning: state.config.isFetching
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: id => dispatch( showConfig() )
  };
};

export default connect( mapStateToProps, mapDispatchToProps )( ConfigButton );
