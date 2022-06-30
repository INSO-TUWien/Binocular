"use strict";

import { handleActions } from "redux-actions";
import _ from "lodash";

export default handleActions(
  {
    //actions

    SET_CURRENT_BRANCH: (state, action) => _.assign({}, state, { currentBranch: action.payload ? action.payload : null }),
    SET_ACTIVE_ISSUE: (state, action) => _.assign({}, state, { activeIssueId: action.payload ? action.payload : null }),
    SET_ACTIVE_FILE: (state, action) => _.assign({}, state, { activeFile: action.payload ? action.payload : null }),
    SET_MODE: (state, action) => _.assign({}, state, { mode: action.payload ? action.payload : null }),
  },
  {
    //initial state

    currentBranch: null,
    activeIssueId: null,
    activeFile: null,
    mode: 'issues',
  }
);
