'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_ACTIVE_VISUALIZATIONS: (state, action) => _.assign({}, state, { visualizations: action.payload }),
    SET_GROUPING: (state, action) => _.assign({}, state, { grouping: action.payload }),
    SET_CATEGORY: (state, action) => _.assign({}, state, { category: action.payload }),
    CRM_SET_ACTIVE_FILES: (state, action) => _.assign({}, state, { globalActiveFiles: action.payload }),
  },
  { visualizations: [], grouping: 'user', category: 'comment', globalActiveFiles: [] },
);
