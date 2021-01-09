'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_LANGUAGE_MODULE_RIVER_RESOLUTION: (state, action) => _.assign({}, state, { chartResolution: action.payload }),
    SET_LANGUAGE_MODULE_RIVER_CHART_ATTRIBUTE: (state, action) => _.assign({}, state, { chartAttribute: action.payload }),
    SET_LANGUAGE_MODULE_RIVER_SHOW_ISSUES: (state, action) => _.assign({}, state, { showIssues: action.payload }),
    SET_LANGUAGE_MODULE_RIVER_SELECTED_AUTHORS: (state, action) => _.assign({}, state, { selectedAuthors: [...action.payload] }),
    SET_LANGUAGE_MODULE_RIVER_SELECTED_LANGUAGES: (state, action) => _.assign({}, state, { selectedLanguages: [...action.payload] }),
    SET_LANGUAGE_MODULE_RIVER_SELECTED_MODULES: (state, action) => _.assign({}, state, { selectedModules: [...action.payload] }),
    SET_LANGUAGE_MODULE_RIVER_SHOW_CI: (state, action) => _.assign({}, state, { showCIChart: action.payload }),
    SET_LANGUAGE_MODULE_RIVER_SHOW_ISSUE: (state, action) => _.assign({}, state, { showIssueChart: action.payload })
  },
  {
    chartResolution: 'months', //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
    chartAttribute: 'languages', //chart river data visualization
    showIssues: 'all', //Filter for issues, can be 'all', 'open' or 'closed'
    selectedAuthors: [], //Authors checked in the CheckBoxLegend, Array of objects: [{id: 1234, gitSignature: 'Dev1 <Dev1@email.com>'}, ...]
    selectedLanguages: [], //languages checked in the CheckBoxLegend, Array of objects
    selectedModules: [], //Modules checked in the CheckBoxLegend, Array of objects
    showCIChart: true, //Show or hide CI Chart
    showIssueChart: true //Show or hide issues chart
  }
);
