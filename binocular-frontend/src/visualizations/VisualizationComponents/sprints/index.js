'use strict';

import ChartComponent from './chart';
import ConfigComponent from './config';
import HelpComponent from './help';
import saga from './sagas';
import reducer from './reducers';

export default {
  id: 'sprints',
  label: 'Sprints',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  usesUniversalSettings: true,
  universalSettingsConfig: { hideExcludeCommitSettings: true, hideMergeCommitSettings: true },
};
