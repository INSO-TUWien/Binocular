'use strict';

import { connect } from 'react-redux';
import ConfigDialog from './ConfigDialog.jsx';

const mapStateToProps = (state, ownProps) => {
  return {
    target: state.config.config,
    initialValues: {
      arangoHost: 'localhost',
      arangoPort: '123'
    }
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default connect( mapStateToProps, mapDispatchToProps )( ConfigDialog );
