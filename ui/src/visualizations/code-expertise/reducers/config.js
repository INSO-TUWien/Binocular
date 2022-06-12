"use strict";

import { handleActions } from "redux-actions";
import _ from "lodash";

export default handleActions(
  {
    //actions

    SET_ACTIVE_ISSUE: (state, action) => _.assign({}, state, { activeIssueId: action.payload ? action.payload.iid : null })
  },
  {
    //initial state

    activeIssueId: 1
  }
);
