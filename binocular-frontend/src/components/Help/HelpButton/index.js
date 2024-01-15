'use strict';

import { connect } from 'react-redux';
import { toggleHelp } from '../../../sagas/index';

import HelpButton from './HelpButton';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    shown: state.showHelp,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClick: () => dispatch(toggleHelp()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HelpButton);
