'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_SHOW_ISSUES: (state, action) => _.assign({}, state, { showIssues: action.payload }),
    SET_HIGHLIGHTED_ISSUE: (state, action) =>
      _.assign({}, state, { highlightedIssue: action.payload })
  },
  { showIssues: true, highlightedIssue: null }
);
