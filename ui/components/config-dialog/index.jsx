'use strict';

import { connect } from 'react-redux';
import ConfigDialog from './ConfigDialog.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.config
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect( mapStateToProps, mapDispatchToProps )( ConfigDialog );
