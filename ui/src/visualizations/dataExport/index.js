'use strict';

import ChartComponent from './dataExport';
import ConfigComponent from './config';
import HelpComponent from './help';
import saga from './sagas';
import reducer from './reducers';

export default {
  id: 'export',
  label: 'Export',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};
