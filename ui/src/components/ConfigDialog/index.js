'use strict';

import { connect } from 'react-redux';
import _ from 'lodash';

import ConfigDialog from './ConfigDialog.js';
import { confirmConfig, hideConfig, switchConfigTab } from '../../sagas/config.js';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    active: state.config.isShown,
    target: _.get(state, 'config.data.config'),
    activeTab: state.activeConfigTab,
    initialValues: {
      gitlabUrl: _.get(state, 'config.data.gitlab.url'),
      gitlabToken: _.get(state, 'config.data.gitlab.token'),
      arangoHost: _.get(state, 'config.data.arango.host'),
      arangoPort: _.get(state, 'config.data.arango.port'),
      arangoUser: _.get(state, 'config.data.arango.user'),
      arangoPassword: _.get(state, 'config.data.arango.password'),
    },
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return Object.assign(
    {
      onSwitchTab: (tab) => {
        dispatch(switchConfigTab(tab));
      },
      onSubmit: (values) => {
        const config = {
          gitlab: {
            url: values.gitlabUrl,
            token: values.gitlabToken,
          },
          arango: {
            host: values.arangoHost,
            port: values.arangoPort,
            user: values.arangoUser,
            password: values.arangoPassword,
          },
        };

        return dispatch(confirmConfig(config));
      },
      onCancel: (e) => {
        dispatch(hideConfig());
        e.preventDefault();
      },
    },
    ownProps
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigDialog);
