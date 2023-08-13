'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_REVERSE_COMMANDS_DATA: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_REVERSE_COMMANDS_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },
  },
  {
    data: {
      branch: 'master',
      branches: [],
      commits: [],
      filteredCommits: [],
    },
    lastFetched: null,
    isFetching: null,
  }
);
