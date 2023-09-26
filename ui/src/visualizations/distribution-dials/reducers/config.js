'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    //actions
    DD_SET_SPLIT_COMMITS: (state, action) => _.assign({}, state, { splitCommits: action.payload ? action.payload : false }),
    DD_SET_SPLIT_CHANGES: (state, action) => _.assign({}, state, { splitChanges: action.payload ? action.payload : false }),
    DD_SET_SPLIT_ISSUES: (state, action) => _.assign({}, state, { splitIssues: action.payload ? action.payload : false }),
  },

  {
    //initial state
    splitCommits: false,
    splitChanges: false,
    splitIssues: false,
  }
);
