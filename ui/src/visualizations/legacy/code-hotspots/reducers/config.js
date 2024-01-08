'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_ACTIVE_FILE: (state, action) =>
      _.assign({}, state, {
        fileURL: action.payload ? action.payload : null,
      }),
    SET_ACTIVE_PATH: (state, action) =>
      _.assign({}, state, {
        path: action.payload ? action.payload : null,
      }),
    SET_ACTIVE_BRANCH: (state, action) =>
      _.assign({}, state, {
        branch: action.payload ? action.payload : null,
      }),
    SET_ACTIVE_FILES: (state, action) =>
      _.assign({}, state, {
        files: action.payload ? action.payload : null,
      }),
    SET_ACTIVE_BRANCHES: (state, action) =>
      _.assign({}, state, {
        branches: action.payload ? action.payload : null,
      }),
  },
  {
    fileURL: '',
    branch: 'main',
    path: '',
    files: [],
    branches: [],
  },
);
