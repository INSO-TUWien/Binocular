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
    SET_SEARCH_TERM: (state, action: Action<any>) => _.assign({}, state, { searchTerm: action.payload }),
    SET_FIRST_COMMIT_TIME: (state, action: Action<any>) => _.assign({}, state, { firstCommitTime: action.payload }),
    SET_MAX_SESSION_LENGTH: (state, action: Action<any>) => _.assign({}, state, { maxSessionLength: action.payload }),
    SET_USE_ACTUAL_TIME: (state, action: Action<any>) => _.assign({}, state, { useActualTime: action.payload }),
    SET_USE_RATIO: (state, action: Action<any>) => _.assign({}, state, { useRatio: action.payload }),
  },
  {
    searchTerm: '',
    selectedBranch: '',
    commitType: ["corrective", "features", "perfective", "nonfunctional", "unknown"],
    threshold: {
      hours: { lower: undefined, upper: undefined },
      change: { lower: undefined, upper: undefined },
      ratio: { lower: undefined, upper: undefined },
    },
    firstCommitTime: 120,
    maxSessionLength: 120,
    useActualTime: false,
    useRatio: false,
  },
);
