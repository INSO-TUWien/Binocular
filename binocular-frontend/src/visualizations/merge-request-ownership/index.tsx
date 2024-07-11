'use-strict';
import ChartComponent from './chart';
import saga from './sagas';
import reducer from './reducers';
import HelpComponent from './help';
import ConfigComponent from './config';

export default {
  id: 'mergeRequestOwnership',
  label: 'Merge Request Ownership',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  usesUniversalSettings: true,
  universalSettingsConfig: {
    hideExcludeCommitSettings: true,
    hideMergeCommitSettings: true,
    hideSprintSettings: true,
    hideGranularitySettings: true,
  },
};
