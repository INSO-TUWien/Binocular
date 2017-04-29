'use strict';

import { connect } from 'react-redux';
import _ from 'lodash';

import ConfigDialog from './ConfigDialog.js';
import { postConfig, hideConfig } from '../../actions.js';

const mapStateToProps = (state/*, ownProps*/) => {
  return {
    active: state.config.isShown,
    target: _.get( state, 'config.data.config' ),
    initialValues: {
      gitlabUrl: _.get( state, 'config.data.gitlab.url' ),
      gitlabToken: _.get( state, 'config.data.gitlab.token' )
    }
  };
};

const mapDispatchToProps = (dispatch/*, ownProps*/) => {
  return {
    onSubmit: values => {
      console.log( 'Values: ', values );
      const config = {
        gitlab: {
          url: values.gitlabUrl,
          token: values.gitlabToken
        }
      };

      return dispatch( postConfig(config) )
      .then( function() {
        return dispatch( hideConfig() );
      } );
    },
    onCancel: () => dispatch( hideConfig() )
  };
};

export default connect( mapStateToProps, mapDispatchToProps )( ConfigDialog );
