'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    // request the conflict awareness data and reset the previous received ones
    REQUEST_CONFLICT_AWARENESS_DATA: (state) => {
      // reset the previously retrieved data
      let data = {};
      data.commits = undefined;
      data.branches = undefined;
      data.commitNodes = undefined;
      data.commitChildLinks = undefined;
      data.parent = state.data.parent;
      data.forks = state.data.forks;

      return _.assign({}, state, { isFetching: true, data: data });
    },

    // receive the requested conflict aware data
    RECEIVE_CONFLICT_AWARENESS_DATA: (state, action) => {
      return _.merge({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },

    // request a diff of a commit
    REQUEST_DIFF: (state) => _.assign({}, state, { isFetching: true }),

    // receive the diff of a commit
    RECEIVE_DIFF: (state, action) => {
      return _.merge({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },

    // request a diff of a commit
    REQUEST_REBASE_CHECK: (state) =>
      _.merge({}, state, { isFetching: true, data: { rebaseCheck: undefined } }),

    // receive the diff of a commit
    RECEIVE_REBASE_CHECK: (state, action) => {
      return _.merge({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },
  },
  {
    data: {},
    lastFetched: null,
    isFetching: null,
  }
);
