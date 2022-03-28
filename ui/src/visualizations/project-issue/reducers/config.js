'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_RESOLUTION: (state, action) => _.assign({}, state, { chartResolution: action.payload }),
    SET_SHOW_ISSUES: (state, action) => _.assign({}, state, { showIssues: action.payload }),
    SET_SELECTED_ISSUES: (state, action) => _.assign({}, state, { selectedIssues: [...action.payload] }),
    SET_DISPLAY_METRIC: (state, action) => _.assign({}, state, { displayMetric: action.payload }),
    SET_SHOW_NORMALIZED_CHART: (state, action) => _.assign({}, state, { showNormalizedChart: action.payload }),
    SET_SHOW_STANDARD_CHART: (state, action) => _.assign({}, state, { showStandardChart: action.payload }),
    SET_SHOW_MILESTONE_CHART: (state, action) => _.assign({}, state, { showMilestoneChart: action.payload })
  },
  {
    chartResolution: 'months', //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
    showIssues: 'all', //Filter for issues, can be 'all', 'open' or 'closed'
    selectedIssues: [], //Issues checked in the CheckBoxLegend, Array of objects: [{id: 1234, gitSignature: 'Dev1 <Dev1@email.com>'}, ...]
    Issues: [], //All Issues that should be displayed in CheckBoxLegend, Same format as above
    displayMetric: 'linesChanged', //display metric for Changes-Chart, can be 'linesChanged' or 'commits'
    showNormalizedChart: false, //Show or hide CI Chart
    showStandardChart: true, //Show or hide issues chart
    showMilestoneChart: false //Show or hide changes chart
  }
);
