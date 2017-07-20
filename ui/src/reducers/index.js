import _ from 'lodash';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { handleAction } from 'redux-actions';

import activeVisualization from './activeVisualization.js';
import visualizations from './visualizations.js';
import config from './config.js';
import codeOwnershipData from './codeOwnershipData.js';
import notifications from './notifications.js';
import progress from './progress.js';
import activeConfigTab from './activeConfigTab.js';

const app = combineReducers({
  activeVisualization,
  visualizations,
  config,
  codeOwnershipData,
  notifications,
  progress,
  activeConfigTab,
  form: formReducer.plugin({
    configForm: handleAction(
      'RECEIVE_CONFIGURATION',
      function(state, action) {
        const config = action.payload;
        return _.merge({}, state, {
          values: {
            gitlabUrl: _.get(config, 'gitlab.url'),
            gitlabToken: _.get(config, 'gitlab.token'),
            arangoHost: _.get(config, 'arango.host'),
            arangoPort: _.get(config, 'arango.port'),
            arangoUser: _.get(config, 'arango.user'),
            arangoPassword: _.get(config, 'arango.password')
          }
        });
      },
      {}
    )
  })
});

export default app;
