'use strict';

import ChartComponent from './chart';
import ConfigComponent from './config';
import HelpComponent from './help';
import saga from './sagas';
import reducer from './reducers';

export default {
  id: 'timeSpent',
  label: 'Time Spent (GitLab Only)',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  usesUniversalSettings: true,
  universalSettingsConfig: { hideMergeCommitSettings: true, hideSprintSettings: true, hideExcludeCommitSettings: true },
};
