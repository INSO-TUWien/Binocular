'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    //actions
    CO_SET_CURRENT_BRANCH: (state, action) => _.assign({}, state, { currentBranch: action.payload ? action.payload : null, details: null }),
  },
  {
    //initial state
    currentBranch: null,
  }
);
