'use strict';

import saga from './sagas';
import ChartComponent from './chart';
import ConfigComponent from './config';
import HelpComponent from './help';

export default {
  id: 'symbolLifespan',
  label: 'Symbols',
  saga,
  reducer: null,
  ChartComponent,
  ConfigComponent,
  HelpComponent
};
