'use strict';

import _ from 'lodash';
import { handleActions } from 'redux-actions';

export default handleActions(
  {
    REQUEST_TEAM_AWARENESS_DATA: state => {
      return _.assign({}, state, { isFetching: true });
    },
    RECEIVE_TEAM_AWARENESS_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt
      });
    }
  },
  {
    data: {},
    lastFetched: null,
    isFetching: null
  }
);
