'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_CODE_CLONE_DATA: state => _.assign({}, state, { isFetching: true }),
    RECEIVE_CODE_CLONE_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt
      });
    }
  },
  {
    data: {
      clone: null,
      clones: []
    },
    lastFetched: null,
    isFetching: null
  }
);
