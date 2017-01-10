'use strict';

import { connect } from 'react-redux';
import ConfigButton from './ConfigButton.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    spinning: state.config.isFetching
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: id => console.log('clicked!')
  };
};

export default connect( mapStateToProps, mapDispatchToProps )( ConfigButton );
