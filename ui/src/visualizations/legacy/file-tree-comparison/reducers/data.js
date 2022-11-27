'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_COMMITS_AND_FILE_TREE: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_COMMITS_AND_FILE_TREE: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },
  },
  {
    data: [
      {
        commits: [],
        tree: [],
        commit1: [],
        commit2: [],
      },
    ],
    lastFetched: null,
    isFetching: null,
  }
);
