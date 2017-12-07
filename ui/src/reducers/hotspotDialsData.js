'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_HOTSPOT_DIALS_DATA: state => _.assign({}, state, { isFetching: true }),
    RECEIVE_HOTSPOT_DIALS_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt
      });
    }
  },
  { lastFetched: null, isFetching: null }
);
