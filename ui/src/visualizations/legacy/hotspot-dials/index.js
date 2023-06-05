'use strict';

import ConfigComponent from './config.js';
import HelpComponent from './help.js';
import saga from './sagas';
import reducer from './reducers';
import ChartComponent from './chart';

export default {
  id: 'hotspotDials',
  label: 'HotspotDials',
  ChartComponent,
  ConfigComponent,
  HelpComponent,
  saga,
  reducer,
  usesUniversalSettings: true,
};
