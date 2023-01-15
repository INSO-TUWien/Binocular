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
    SET_TREE_1: (state, action) =>
      _.assign({}, state, {
        tree1: action.payload ? action.payload : null,
      }),
    SET_TREE_2: (state, action) =>
      _.assign({}, state, {
        tree2: action.payload ? action.payload : null,
      }),
    SET_CHANGED: (state, action) =>
      _.assign({}, state, {
        changed: action.payload ? action.payload : null,
      }),
    SET_FILTER: (state, action) =>
      _.assign({}, state, {
        filter: action.payload ? action.payload : null,
      }),
    DISPLAY_ONLY_CHANGED: (state, action) =>
      _.assign({}, state, {
        displayOnlyChanged: action.payload ? action.payload : false,
      }),
  },
  {
    commit1: [],
    commit2: [],
    tree1: [],
    tree2: [],
    changed: {
      add: [],
      delete: [],
      edit: [],
    },
    filter: '',
    displayOnlyChanged: null,
  }
);
