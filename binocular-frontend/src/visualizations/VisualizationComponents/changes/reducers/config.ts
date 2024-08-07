'use strict';

import { Action, handleActions } from 'redux-actions';
import * as _ from 'lodash';

export default handleActions(
  {
    SET_SELECTED_AUTHORS: (state, action: Action<any>) => _.assign({}, state, { selectedAuthors: [...action.payload] }),
    SET_DISPLAY_METRIC: (state, action: Action<any>) => _.assign({}, state, { displayMetric: action.payload }),
  },
  {
    chartResolution: 'months', //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
    selectedAuthors: [], //Users checked in the CheckBoxLegend, Array of objects: [{id: 1234, gitSignature: 'Dev1 <Dev1@email.com>'}, ...]
    availableAuthors: [], //All authors that should be displayed in CheckBoxLegend, Same format as above
    displayMetric: 'linesChanged', //display metric for Empty-Chart, can be 'linesChanged' or 'commits'
  },
);
