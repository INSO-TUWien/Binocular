'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_COMMIT_1: (state, action) =>
      _.assign({}, state, {
        commit1: action.payload ? action.payload : null,
      }),
    SET_COMMIT_2: (state, action) =>
      _.assign({}, state, {
        commit2: action.payload ? action.payload : null,
      }),
  },
  {
    commit1: [],
    commit2: [],
    tree1: [],
    tree2: [],
  }
);