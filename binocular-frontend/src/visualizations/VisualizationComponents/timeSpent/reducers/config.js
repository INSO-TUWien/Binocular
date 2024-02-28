'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  { SET_AGGREGATE_TIME: (state, action) => _.assign({}, state, { aggregateTime: action.payload }) },
  { aggregateTime: false },
);
