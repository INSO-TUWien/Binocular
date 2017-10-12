'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_SHOW_ISSUES: (state, action) => _.assign({}, state, { showIssues: action.payload }),
    SET_HIGHLIGHTED_ISSUE: (state, action) =>
      _.assign({}, state, { highlightedIssue: action.payload, highlightedCommits: [] }),
    SET_COMMIT_ATTRIBUTE: (state, action) =>
      _.assign({}, state, { commitAttribute: action.payload }),

    COR_SET_VIEWPORT: (state, action) => _.assign({}, state, { viewport: action.payload }),

    COR_RECEIVE_RELATED_COMMITS: (state, action) => {
      return _.assign({}, state, {
        highlightedCommits: action.payload
      });
    }
  },
  {
    showIssues: true,
    highlightedIssue: null,
    highlightedCommits: [],
    commitAttribute: 'count',
    viewport: []
  }
);
