import _ from 'lodash';
import { combineReducers } from 'redux';
import { handleAction } from 'redux-actions';

import activeVisualization from './activeVisualization.js';
import config from './config.js';
import notifications from './notifications.js';
import progress from './progress.js';
import activeConfigTab from './activeConfigTab.js';
import universalSettings from './universalSettings';

export default (visualizations) => {
  const visualizationReducers = {};
  _.each(visualizations, (vis) => {
    visualizationReducers[vis.id] = combineReducers({
      id: () => vis.id,
      label: () => vis.label,
      ConfigComponent: () => vis.ConfigComponent,
      ChartComponent: () => vis.ChartComponent,
      HelpComponent: () => vis.HelpComponent || (() => <div />),
      saga: () => vis.saga,
      reducer: () => vis.reducer,
      state: vis.reducer,
      usesUniversalSettings: () => (vis.usesUniversalSettings !== undefined ? vis.usesUniversalSettings : false),
      universalSettingsConfig: () => (vis.universalSettingsConfig !== undefined ? vis.universalSettingsConfig : {}),
      //ternary operator (?) needed for compatibility for older visualizations that don't use Universal settings
    });
  });

  return combineReducers({
    activeVisualization,
    visualizations: combineReducers(visualizationReducers),
    config,
    notifications,
    progress,
    activeConfigTab,
    showHelp: handleAction('TOGGLE_HELP', (state) => !state, false),
    universalSettings,
  });
};
