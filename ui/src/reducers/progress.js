'use strict';

import { handleActions } from 'redux-actions';

export default handleActions(
  {
    message: (state, action) => {
      return action.report;
    }
  },
  {
    commits: { total: 1, processed: 0 },
    issues: { total: 1, processed: 0 },
    builds: { total: 1, processed: 0 },
    languages: { total: 0, processed: 0 }
  }
);
