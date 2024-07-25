'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

const highlights = new Set<string>();

const setPath = (state, action) => {
  const highlight = new Set(state.path);
  if (highlight.has(action.payload)) {
    highlight.delete(action.payload);
  } else {
    highlight.add(action.payload);
  }
  return _.assign({}, state, { path: highlight });
};

const initHighlights = (state, action) => {
  const highlight = new Set(action.payload);
  return _.assign({}, state, { path: highlight });
};

export default handleActions(
  {
    SET_ACTIVE_VISUALIZATIONS: (state, action) => _.assign({}, state, { visualizations: action.payload }),
    SET_GROUPING: (state, action) => _.assign({}, state, { grouping: action.payload }),
    SET_CATEGORY: (state, action) => _.assign({}, state, { category: action.payload }),
    SET_PATH: setPath,
    SET_FILE: (state, action) => _.assign({}, state, { file: action.payload }),
    INIT_HIGHLIGHTS: initHighlights,
  },
  { visualizations: [], grouping: 'user', category: 'comment', path: highlights, file: '' },
);
