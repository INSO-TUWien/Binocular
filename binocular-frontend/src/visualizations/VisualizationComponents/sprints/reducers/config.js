'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_COLOR_ISSUES_MERGE_REQUESTS: (state, action) => _.assign({}, state, { colorIssuesMergeRequests: action.payload }),
  },
  { colorIssuesMergeRequests: 0 },
);
