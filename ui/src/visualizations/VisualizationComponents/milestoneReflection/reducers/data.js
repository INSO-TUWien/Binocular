'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    MS_REQUEST_ISSUE_DATA: (state) => {
      return _.assign({}, state, { isFetching: true });
    },
    MS_RECEIVE_ISSUE_DATA: (state, action) => {
      return _.assign({}, state, {
        issues: action.payload,
        isFetching: false,
        receivedAt: Date.now(),
      });
    },
  },
  {
    issues: [],
    lastFetched: null,
    isFetching: null,
  }
);
