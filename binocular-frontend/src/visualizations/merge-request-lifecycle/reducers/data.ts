'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

interface MergeRequestLifeCycleAction {
  payload: any;
  meta: {
    receivedAt: Date;
  };
  type: string;
}

export default handleActions(
  {
    REQUEST_MERGE_REQUEST_LIFECYCLE_DATA: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_MERGE_REQUEST_LIFECYCLE_DATA: (state, action: MergeRequestLifeCycleAction) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },
  },
  {
    data: {},
    lastFetched: null,
    isFetching: null,
  },
);
