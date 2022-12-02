'use strict';

import ChartComponent from './chart';
import ConfigComponent from './config.js';
import HelpComponent from './help.js';
import saga, { setCommit1, setCommit2 } from './sagas';
import reducer from './reducers';

export default {
  id: 'fileTreeComparison',
  label: 'FileTreeComparison',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};
