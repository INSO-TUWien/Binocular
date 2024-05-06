'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

interface CodeReviewMeticsAction {
  payload: any;
  meta: {
    receivedAt: Date;
  };
  type: string;
}

export default handleActions(
  {
    REQUEST_CODE_REVIEW_METRICS_DATA: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_CODE_REVIEW_METRICS_DATA: (state, action: CodeReviewMeticsAction) => {
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
