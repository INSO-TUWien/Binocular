'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_SHOW_ISSUES: (state, action) => _.assign({}, state, { showIssues: action.payload }),
    SET_HIGHLIGHTED_ISSUE: (state, action) =>
      _.assign({}, state, { highlightedIssue: action.payload }),
    SET_COMMIT_ATTRIBUTE: (state, action) =>
      _.assign({}, state, { commitAttribute: action.payload })
  },
  { showIssues: true, highlightedIssue: null, commitAttribute: 'count' }
);
