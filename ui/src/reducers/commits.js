'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_COMMITS: state => _.assign({}, state, { isFetching: true }),
    RECEIVE_COMMITS: (state, action) =>
      _.merge({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt
      })
  },
  { lastFetched: null, isFetching: null }
);
