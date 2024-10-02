'use strict';

import ChartComponent from './chart';
import ConfigComponent from './config';
import HelpComponent from './help';
import saga from './sagas';
import reducer from './reducers';

export default {
  id: 'codeExpertise',
  label: 'Code Expertise',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  usesUniversalSettings: true,
  universalSettingsConfig: {
    hideGranularitySettings: true,
    hideDateSettings: true,
    hideSprintSettings: true,
  },
};
