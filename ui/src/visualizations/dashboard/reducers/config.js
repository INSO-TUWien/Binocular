'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_RESOLUTION: (state, action) => _.assign({}, state, {chartResolution: action.payload}),
    SET_SHOW_ISSUES: (state, action) => _.assign({}, state, {showIssues: action.payload}),
    SET_SELECTED_AUTHORS: (state, action) => _.assign({}, state, {selectedAuthors: [...action.payload]}),
    SET_DISPLAY_METRIC: (state, action) => _.assign({}, state, {displayMetric: action.payload}),
    SET_SHOW_CI_CHART: (state, action) => _.assign({}, state, {showCIChart: action.payload}),
    SET_SHOW_ISSUE_CHART: (state, action) => _.assign({}, state, {showIssueChart: action.payload}),
    SET_SHOW_CHANGES_CHART: (state, action) => _.assign({}, state, {showChangesChart: action.payload})
  },
  {
    chartResolution: 'months',      //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
    showIssues: 'all',              //Filter for issues, can be 'all', 'open' or 'closed'
    selectedAuthors: [],            //Authors checked in the CheckBoxLegend, Array of objects: [{id: 1234, gitSignature: 'Dev1 <Dev1@email.com>'}, ...]
    availableAuthors: [],           //All authors that should be displayed in CheckBoxLegend, Same format as above
    displayMetric: 'linesChanged',  //display metric for Changes-Chart, can be 'linesChanged' or 'commits'
    showCIChart: true,              //Show or hide CI Chart
    showIssueChart: true,           //Show or hide issues chart
    showChangesChart: true,         //Show or hide changes chart
  }
);
