'use strict';

import saga from './sagas';
import reducer from './reducers';
import HelpComponent from './help.js';
import ConfigComponent from './config.js';
import ChartComponent from './chart';


export default {
  id: 'codeOwnershipTransfer',
  label: 'Transfer of Code Ownership',
  HelpComponent,
  reducer,
  saga,
  ConfigComponent,
  ChartComponent


};
