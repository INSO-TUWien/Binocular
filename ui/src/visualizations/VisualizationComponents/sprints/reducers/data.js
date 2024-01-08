'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_SPRINTS_DATA: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_SPRINTS_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },
  },
  {
    data: { issues: [], mergeRequests: [] },
    lastFetched: null,
    isFetching: null,
  },
);
