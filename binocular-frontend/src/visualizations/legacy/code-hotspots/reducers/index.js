'use strict';

import config from './config';
import data from './data';
import { combineReducers } from 'redux';

export default combineReducers({
  config,
  data,
});
