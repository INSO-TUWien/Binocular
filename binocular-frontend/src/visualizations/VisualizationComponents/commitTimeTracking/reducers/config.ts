'use strict';

import { Action, handleActions } from 'redux-actions';
import * as _ from 'lodash';

export default handleActions(
  {
    SET_SELECTED_BRANCH: (state, action: Action<any>) => _.assign({}, state, { selectedBranch: action.payload }),
    SET_SELECTED_COMMIT_TYPE: (state, action: Action<any>) => _.assign({}, state, { commitType: action.payload }),
    SET_THRESHOLD: (state, action: Action<any>) => {
      const currState = { ...state };
      const value = action.payload.value;
      const threshold = action.payload.threshold.split('-'); // combinations of hours/time/ratio and lower/upper separated by a dash
      currState.threshold[threshold[0]][threshold[1]] = value;
      return _.assign({}, state, { threshold: { ...currState.threshold } });
    },
  },
  {
    selectedBranch: 'master', //Branch to be displayed
    commitType: 'all', //Filter to display relevant commits, can be 'all' or any of the commit types
    threshold: {
      hours: { lower: 0, upper: 0 },
      change: { lower: 0, upper: 0 },
      ratio: { lower: 0, upper: 0 },
    }, //Filter for threshold for commits based on line changes, time spent and their ratio
  },
);
