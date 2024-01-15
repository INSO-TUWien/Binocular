'use strict';

import { Action, handleActions } from 'redux-actions';
import * as _ from 'lodash';

export default handleActions(
  {
    REQUEST_CHANGES_DATA: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_CHANGES_DATA: (state, action: Action<any>) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
      });
    },
  },
  {
    data: {},
    isFetching: null,
  },
);
