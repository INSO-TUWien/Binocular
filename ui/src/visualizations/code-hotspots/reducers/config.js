'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_ACTIVE_FILE: (state, action) =>
      _.assign({}, state, {
        fileURL: action.payload ? action.payload : null }),
    SET_ACTIVE_PATH: (state, action) =>
      _.assign({}, state, {
        path: action.payload ? action.payload : null }),
    SET_ACTIVE_BRANCH: (state, action) =>
      _.assign({}, state, {
        branch: action.payload ? action.payload : null })
  },
  {
    fileURL: "https://raw.githubusercontent.com/INSO-TUWien/Binocular/master/pupil.js",
    branch: "master",
    path: "pupil.js",
    files:[]
  }
);
