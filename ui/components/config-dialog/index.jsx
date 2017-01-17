'use strict';

import { connect } from 'react-redux';
import _ from 'lodash';

import ConfigDialog from './ConfigDialog.jsx';
import { postConfig, hideConfig } from '../../actions.jsx';

const mapStateToProps = (state, ownProps) => {
  const port = _.get( state, 'config.data.arango.port' );
  return {
    active: state.config.isShown,
    target: _.get( state, 'config.data.config' ),
    initialValues: {
      arangoHost: _.get( state, 'config.data.arango.host' ),
      arangoPort: port,
      gitlabUrl: _.get( state, 'config.data.gitlab.url' ),
      gitlabToken: _.get( state, 'config.data.gitlab.token' ),
    }
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: values => {
      console.log( 'Values: ', values );
      const config = {
        arango: {
          host: values.arangoHost,
          port: values.arangoPort,
          user: values.arangoUser,
          password: values.arangoPassword
        },
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
