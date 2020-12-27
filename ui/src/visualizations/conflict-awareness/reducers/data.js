'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_CONFLICT_AWARENESS_DATA: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_CONFLICT_AWARENESS_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },
  },
  {
    data: {
      commits: undefined,
      branches: undefined,
    },
    lastFetched: null,
    isFetching: null,
  }
);
