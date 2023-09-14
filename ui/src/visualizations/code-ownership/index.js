'use strict';

import ChartComponent from './chart';
import ConfigComponent from './config';
import HelpComponent from './help.js';
import saga from './sagas';
import reducer from './reducers';

export default {
  id: 'codeOwnership',
  label: 'Code Ownership',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  usesUniversalSettings: true,
  universalSettingsConfig: { hideCommitSettings: true },
};
