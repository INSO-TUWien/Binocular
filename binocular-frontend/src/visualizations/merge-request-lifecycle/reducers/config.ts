'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';
export default handleActions(
  {
    SET_ACTIVE_VISUALIZATIONS: (state, action) => _.assign({}, state, { visualizations: action.payload }),
    SET_GROUPING: (state, action) => _.assign({}, state, { grouping: action.payload }),
    SET_GRANULARITY: (state, action) => _.assign({}, state, { granularity: action.payload }),
  },
  { visualizations: [], grouping: 'category', granularity: 'hour' },
);
