'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';
export default handleActions(
  {
    SET_ACTIVE_VISUALIZATIONS: (state, action) => _.assign({}, state, { visualizations: action.payload }),
    SET_CATEGORY: (state, action) => _.assign({}, state, { category: action.payload }),
  },

  { visualizations: [], category: 'assignees' },
);
