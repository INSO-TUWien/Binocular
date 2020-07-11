'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_ACTIVE_FILE: (state, action) =>
      _.assign({}, state, {
        fileURL: action.payload ? action.payload : null }),
    SET_ACTIVE_BRANCH: (state, action) =>
      _.assign({}, state, {
        branch: action.payload ? action.payload : null })
  },
  {
    fileURL: "/pupil.js",
    branch: "master"
  }
);
