'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';
export default handleActions(
  {
    SET_ACTIVE_VISUALIZATIONS: (state, action) => _.assign({}, state, { visualizations: action.payload }),
    SET_SHOW_MERGE_REQUESTS: (state, action) => _.assign({}, state, { showMergeRequests: action.payload }),
    CRM_SET_GROUP: (state, action) => _.assign({}, state, { group: action.payload }),
  },
  { visualizations: [], showMergeRequests: 'category', group: 'hour' },
);
