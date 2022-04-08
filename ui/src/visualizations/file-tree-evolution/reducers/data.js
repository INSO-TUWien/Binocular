'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_FILE_TREE_EVOLUTION_DATA: state => _.assign({}, state, { isFetching: true }),
    RECEIVE_FILE_TREE_EVOLUTION_DATA: (state, action) => {
      const ret = _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt
      });

      return ret;
    }
  },
  {
    data: {},
    lastFetched: null,
    isFetching: null
  }
);
