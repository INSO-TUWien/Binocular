import _ from 'lodash';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { handleAction } from 'redux-actions';

import activeVisualization from './activeVisualization.js';
import config from './config.js';
import notifications from './notifications.js';
import progress from './progress.js';
import activeConfigTab from './activeConfigTab.js';

export default visualizations => {
  const visualizationReducers = {};
  _.each(visualizations, vis => {
    visualizationReducers[vis.id] = combineReducers({
      id: () => vis.id,
      label: () => vis.label,
      ConfigComponent: () => vis.ConfigComponent,
      ChartComponent: () => vis.ChartComponent,
      HelpComponent: () => vis.HelpComponent || (() => <div />),
      saga: () => vis.saga,
      reducer: () => vis.reducer,
      state: vis.reducer
    });
  });

  return combineReducers({
    activeVisualization,
    visualizations: combineReducers(visualizationReducers),
    config,
    notifications,
    progress,
    activeConfigTab,
    showHelp: handleAction('TOGGLE_HELP', state => !state, true),
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
};
