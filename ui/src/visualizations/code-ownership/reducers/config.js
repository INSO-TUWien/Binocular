'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    //actions
    CO_SET_CURRENT_BRANCH: (state, action) => _.assign({}, state, { currentBranch: action.payload ? action.payload : null }),
    CO_SET_ACTIVE_FILES: (state, action) => _.assign({}, state, { activeFiles: action.payload ? action.payload : [] }),
    CO_SET_MODE: (state, action) => _.assign({}, state, { mode: action.payload ? action.payload : null }),
  },
  {
    //initial state
    currentBranch: null,
    activeFiles: [],
    mode: 'absolute',
  },
);
