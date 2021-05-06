'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_CODE_FILE_DATA: (state, action) =>
      _.assign({}, state, { file: action.payload, isFetching: true }),
    RECEIVE_CODE_FILE_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt
      });
    },
    RECEIVE_ALL_BLAMES: (state, action) => {
      return _.assign({}, state, {
        blames: action.payload.blames,
        receivedAt: action.meta.receivedAt
      });
    },
    UPDATE_OVERLAY: (state, action) => {
      return _.assign({}, state, {
        overlay: action.payload
      });
    },
    UPDATE_CODE: (state, action) => {
      return _.assign({}, state, {
        update: action.payload,
        receivedAt: action.meta.receivedAt
      });
    }
  },
  {
    blames: {},
    overlay: {},
    data: {},
    update: {},
    lastFetched: null,
    isFetching: null
  }
);
