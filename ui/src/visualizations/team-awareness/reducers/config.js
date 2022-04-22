'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_TEAM_AWARENESS_ACTIVITY_SCALE: (state, action) => _.assign({}, state, { selectedActivityScale: action.payload }),
    SET_TEAM_AWARENESS_ACTIVITY_DIMENSIONS: (state, action) => _.assign({}, state, action.payload),
    SET_TEAM_AWARENESS_BRANCH: (state, action) => _.assign({}, state, { selectedBranch: action.payload })
  },
  {
    selectedBranch: 'all',
    selectedActivityScale: 'commits',
    activityRestricted: false,
    activityDims: []
  }
);
