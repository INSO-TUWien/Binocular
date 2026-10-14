'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_ISSUE_LABEL_DATA: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_ISSUE_LABEL_DATA: (state, action) => {
      const ret = _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });

      return ret;
    },
  },
  {
    //initial state
    data: {},
    lastFetched: null,
    isFetching: null,
  },
);
