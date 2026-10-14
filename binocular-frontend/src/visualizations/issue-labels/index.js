'use strict';

import ChartComponent from './chart';
import ConfigComponent from './config';
import HelpComponent from './help';
import saga from './sagas';
import reducer from './reducers';

export default {
  id: 'issueLabels',
  label: 'Issue Labels',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  usesUniversalSettings: true,
  universalSettingsConfig: {
    hideGranularitySettings: false,
    hideDateSettings: false,
    hideSprintSettings: true,
  },
};
