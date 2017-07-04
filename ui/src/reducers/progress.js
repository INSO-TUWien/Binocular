'use strict';

import { handleActions } from 'redux-actions';

export default handleActions(
  {
    message: (state, action) => {
      console.log('action:', action);
      return action.report;
    }
  },
  {
    commits: { total: 1, processed: 0 },
    issues: { total: 1, processed: 0 }
  }
);
