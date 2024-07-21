'use strict';

import config from './config.ts';
import data from './data.ts';
import { combineReducers } from 'redux';

export default combineReducers({
  data,
  config,
});
