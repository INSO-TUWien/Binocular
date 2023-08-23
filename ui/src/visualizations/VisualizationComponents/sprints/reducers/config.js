'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_COLOR_ISSUES_MERGE_REQUESTS_MOST_TIME_SPENT: (state, action) =>
      _.assign({}, state, { colorIssuesMergeRequestsMostTimeSpent: action.payload }),
  },
  { colorIssuesMergeRequestsMostTimeSpent: false }
);
