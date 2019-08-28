'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_RESOLUTION: (state, action) => _.assign({}, state, {chartResolution: action.payload}),
    SET_SHOW_DEVS: (state, action) => _.assign({}, state, {showDevsInCI: action.payload}),
    SET_SHOW_ISSUES: (state, action) => _.assign({}, state, {showIssues: action.payload}),
    SET_SELECTED_AUTHORS: (state, action) => _.assign({}, state, {selectedAuthors: action.payload}),
    SET_AVAILABLE_AUTHORS: (state, action) => _.assign({}, state, {availableAuthors: action.payload}),
    SET_DISPLAY_METRIC: (state, action) => _.assign({}, state, {displayMetric: action.payload}),

    COR_SET_VIEWPORT: (state, action) => _.assign({}, state, { viewport: action.payload }),

    COR_RECEIVE_RELATED_COMMITS: (state, action) => {
      return _.assign({}, state, {
        highlightedCommits: action.payload
      });
    }
  },
  {
    chartResolution: 'months',      //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
    showDevsInCI: false,            //show split by developers in CI chart, can be true or false
    showIssues: 'all',              //Filter for issues, can be 'all', 'open' or 'closed'
    selectedAuthors: [],            //Authors checked in the CheckBoxLegend, Array of objects: [{id: 1234, gitSignature: 'Dev1 <Dev1@email.com>'}, ...]
    availableAuthors: [],                 //All authors that should be displayed in CheckBoxLegend, Same format as above
    displayMetric: '#linesChanged' //display metric for Changes-Chart, can be '#linesChanged' or '#commits'
  }
);
