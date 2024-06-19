'use strict';

import { Action, handleActions } from 'redux-actions';
import * as _ from 'lodash';

export default handleActions(
  {
    SET_SELECTED_AUTHORS: (state, action: Action<any>) => _.assign({}, state, { selectedAuthors: [...action.payload] }),
    SET_SELECTED_BRANCH: (state, action: Action<any>) => _.assign({}, state, { selectedBranch: action.payload }),
    SET_SELECTED_COMMIT_TYPE: (state, action: Action<any>) => _.assign({}, state, { commitType: action.payload }),
    SET_THRESHOLD: (state, action: Action<any>) => _.assign({}, state, { threshold: { ...action.payload } }),
  },
  {
    selectedAuthors: [], //Authors checked in the CheckBoxLegend, Array of objects: [{id: 1234, gitSignature: 'Dev1 <Dev1@email.com>'}, ...]
    availableAuthors: [], //All authors that should be displayed in CheckBoxLegend, Same format as above
    selectedBranch: 'main', //Branch to be displayed
    commitType: 'all', //Filter to display relevant commits, can be 'all' or any of the commit types
    threshold: {}, //Filter for threshold for commits based on line changes, time spent and their ratio
  },
);
