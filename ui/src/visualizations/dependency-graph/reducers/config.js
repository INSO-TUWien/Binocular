'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_DEPTH: (state, action) => _.assign({}, state, { depth: parseInt(action.payload, 10), fileTree: [], reloaded: true }),
    SET_COMBINED_THRESHHOLD: (state, action) => _.assign({}, state, { meanPercentageOfCombinedCommitsThreshold: parseInt(action.payload, 10), reloaded: false }),
    SET_MAX_THRESHHOLD: (state, action) => _.assign({}, state, { meanPercentageOfMaxCommitsThreshold: parseInt(action.payload, 10), reloaded: false }),
    SET_FILES: (state, action) => _.assign({}, state, { fileTree: action.payload, reloaded: false }),
    RELOAD_DATA: (state, action) => _.assign({}, state, { reloaded: action.payload })
  },
  {
    depth: 1,
    meanPercentageOfCombinedCommitsThreshold: 40,
    meanPercentageOfMaxCommitsThreshold: 40,
    fileTree: [],
    reloaded: true,
    fromTimestamp: 0,
    toTimestamp: 0
  }
);
