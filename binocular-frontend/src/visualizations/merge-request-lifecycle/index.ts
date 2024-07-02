'use-strict';
import ChartComponent from './chart';
import saga from './sagas';
import reducer from './reducers';
import HelpComponent from './help';
import ConfigComponent from './config';

export default {
  id: 'mergeRequestLifeCycle',
  label: 'Merge Request Lifecycle',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  usesUniversalSettings: false,
};
