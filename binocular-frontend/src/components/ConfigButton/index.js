'use strict';

import { connect } from 'react-redux';

import ConfigButton from './ConfigButton';
import { showConfig } from '../../sagas/config';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    spinning: state.config.isFetching,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClick: () => dispatch(showConfig()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigButton);
