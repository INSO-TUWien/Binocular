'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_ACTIVE_BRANCH: (state, action) =>
      _.assign({}, state, {
        branch: action.payload ? action.payload : null,
      }),
    SET_DISPLAY_METRIC: (state, action) =>
      _.assign({}, state, {
        displayMetric: action.payload ? action.payload : null,
      }),
    SET_DISPLAY_BY_AUTHORS: (state, action) =>
      _.assign({}, state, {
        displayByAuthors: action.payload ? action.payload : null,
      }),


  },
  {
    branch: 'No Branch Chosen',
    files: [],
    displayByAuthors: false,
    displayMetric: 'linesChanged',
  }
);
