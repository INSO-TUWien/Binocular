'use strict';

import config from './config.js';
import data from './data.js';
import { combineReducers } from 'redux';
import visualizationRegistry from '../visualizationRegistry';
import vis from 'redux-form/lib/immutable';

export default function () {
  let combinedReducer = {};
  for (const visualization in visualizationRegistry) {
    const reducer = visualizationRegistry[visualization].reducer;
    if (reducer !== undefined) {
      combinedReducer = combineReducers({ combinedReducer, reducer });
    }
  }

  return combinedReducer;
}
