'use strict';

import ChartComponent from './chart';
import ConfigComponent from './config.tsx';
import HelpComponent from './help.tsx';
import saga from './sagas';
import reducer from './reducers';

export default {
  id: 'commitTimeTracking',
  label: 'Commit Time Tracking',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  usesUniversalSettings: true,
  universalSettingsConfig: { hideGranularitySettings: true },
};
