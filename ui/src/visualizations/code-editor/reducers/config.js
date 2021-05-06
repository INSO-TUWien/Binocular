'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';
export default handleActions(
  {
    SET_SELECTED_BLAMES: (state, action) =>
      _.assign({}, state, { blames: action.payload, isFetching: true }),
    REQUEST_ALL_FILES: state => _.assign({}, state, { isFetching: true }),
    RECEIVE_ALL_FILES: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt
      });
    }
  },
  {
    blames: [],
    data: {},
    lastFetched: null,
    isFetching: null
  }
);
