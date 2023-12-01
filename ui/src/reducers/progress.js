'use strict';

import { handleActions } from 'redux-actions';

export default handleActions(
  {
    PROGRESS: (state, action) => {
      return action.report;
    },
  },
  {
    commits: { total: 0, processed: 0 },
    issues: { total: 0, processed: 0 },
    builds: { total: 0, processed: 0 },
    files: { total: 0, processed: 0 },
    mergeRequests: { total: 0, processed: 0 },
    modules: { total: 0, processed: 0 },
  }
);
