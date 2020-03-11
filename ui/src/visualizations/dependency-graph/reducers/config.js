'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_DEPTH: (state, action) => _.assign({}, state, { depth: parseInt(action.payload, 10) }),
    SET_COMBINED_THRESHHOLD: (state, action) => _.assign({}, state, { meanPercentageOfCombinedCommitsThreshold: parseInt(action.payload, 10) }),
    SET_MAX_THRESHHOLD: (state, action) => _.assign({}, state, { meanPercentageOfMaxCommitsThreshold: parseInt(action.payload, 10) })
  },
  {
    depth: 1,
    meanPercentageOfCombinedCommitsThreshold: 40,
    meanPercentageOfMaxCommitsThreshold: 40,
    fileTree: []
  }
);
