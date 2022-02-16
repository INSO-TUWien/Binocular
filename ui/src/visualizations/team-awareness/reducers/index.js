'use strict';

import { combineReducers } from 'redux';
import data from './data';
import config from './config';

export default combineReducers({ config, data });
