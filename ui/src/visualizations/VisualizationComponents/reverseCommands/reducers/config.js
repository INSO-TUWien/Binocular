'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_SELECTED_AUTHORS: (state, action) => _.assign({}, state, { selectedAuthors: [...action.payload] }),
    SET_DISPLAY_METRIC: (state, action) => _.assign({}, state, { displayMetric: action.payload }),
    SET_ACTIVE_BRANCHES: (state, action) =>
      _.assign({}, state, {
        branches: action.payload ? action.payload : null,
      }),
    SET_ACTIVE_BRANCH: (state, action) =>
      _.assign({}, state, {
        branch: action.payload ? action.payload : null,
      }),
  },
  {
    chartResolution: 'months', //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
    selectedAuthors: [], //Authors checked in the CheckBoxLegend, Array of objects: [{id: 1234, gitSignature: 'Dev1 <Dev1@email.com>'}, ...]
    availableAuthors: [], //All authors that should be displayed in CheckBoxLegend, Same format as above
    displayMetric: 'linesChanged', //display metric for Empty-Chart, can be 'linesChanged' or 'commits'
    branches: [],
    branch: 'main',
    commits: [],
    filteredCommits: [],
  }
);
