'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_SHOW_ISSUES: (state, action) => _.assign({}, state, { showIssues: action.payload }),
  },
  {
    chartResolution: 'months', //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
    showIssues: 'all', //Filter for issues, can be 'all', 'open' or 'closed'
  },
);
