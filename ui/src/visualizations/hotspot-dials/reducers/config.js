'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_CATEGORY: (state, action) => _.assign({}, state, { category: action.payload }),
    SET_SPLIT_COMMITS: (state, action) => _.assign({}, state, { splitCommits: action.payload }),
    SET_ISSUE_FIELD: (state, action) => _.assign({}, state, { issueField: action.payload })
  },
  {
    category: 'hour',
    splitCommits: true,
    issueField: 'createdAt'
  }
);
