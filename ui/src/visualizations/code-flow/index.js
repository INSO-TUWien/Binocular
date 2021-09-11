'use strict';

import ChartComponent from './chart';
import ConfigComponent from './config.js';
import HelpComponent from './help.js';
import saga from './sagas';
import reducer from './reducers';

export default {
  id: 'codeFlow',
  label: 'Code Flow',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent
};
