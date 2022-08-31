'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';
import { flattenNode } from '../sagas/fileTreeOperations';

export default handleActions(
  {
    SET_TEAM_AWARENESS_ACTIVITY_SCALE: (state, action) => _.assign({}, state, { selectedActivityScale: action.payload }),
    SET_TEAM_AWARENESS_ACTIVITY_DIMENSIONS: (state, action) => _.assign({}, state, action.payload),
    SET_TEAM_AWARENESS_BRANCH: (state, action) => _.assign({}, state, { selectedBranch: action.payload }),
    SET_TEAM_AWARENESS_CONFLICT_BRANCH: (state, action) => _.assign({}, state, { selectedConflictBranch: action.payload }),
    SET_TEAM_AWARENESS_FILTERED_FILES: (state, action) => {
      const nextFilter = new Map();
      state.fileFilter.files.forEach(f => nextFilter.set(f.id, f));

      const addToMap = file => nextFilter.set(file.id, file);
      const deleteFromMap = file => nextFilter.delete(file.id);

      let operation = state.fileFilter.mode === 'EXCLUDE' && action.payload.selected === false ? addToMap : deleteFromMap;
      if (state.fileFilter.mode === 'INCLUDE') {
        operation = action.payload.selected === true ? addToMap : deleteFromMap;
      }

      flattenNode(action.payload.node).forEach(n => operation(n));
      return _.assign({}, state, {
        fileFilter: _.assign({}, state.fileFilter, { files: Array.from(nextFilter.values()) })
      });
    },
    SET_TEAM_AWARENESS_FILE_FILTER_MODE: (state, action) => _.assign({}, state, { fileFilter: { mode: action.payload, files: [] } }),
    SET_TEAM_AWARENESS_CONFLICT_PARTNERS: (state, action) => Object.assign({}, state, { highlightedStakeholders: action.payload })
  },
  {
    fileFilter: {
      mode: 'EXCLUDE',
      files: []
    },
    highlightedStakeholders: [],
    selectedBranch: 'all',
    selectedConflictBranch: 'not_set',
    selectedActivityScale: 'commits',
    activityRestricted: false,
    activityDims: []
  }
);
