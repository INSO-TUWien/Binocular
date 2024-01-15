'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    //actions
    DD_SET_LAYERS: (state, action) => _.assign({}, state, { layers: action.payload ? action.payload : [] }),
    DD_SET_SPLIT_LAYERS: (state, action) => _.assign({}, state, { layersSplit: action.payload ? action.payload : [] }),
    DD_SET_SELECT_LAYERS: (state, action) => _.assign({}, state, { layersSelected: action.payload ? action.payload : [] }),
    DD_SET_FILTER_COMMITS_CHANGES: (state, action) =>
      _.assign({}, state, { filterCommitsChanges: action.payload ? action.payload : false }),
    DD_SET_FILTER_COMMITS_CHANGES_CUTOFF: (state, action) =>
      _.assign({}, state, { filterCommitsChangesCutoff: action.payload ? action.payload : 1000 }),
    DD_SET_COLOR_SEGMENTS: (state, action) => _.assign({}, state, { colorSegments: action.payload ? action.payload : false }),
  },

  {
    //initial state
    layers: ['commits', 'changes', 'issues'],
    layersSplit: [],
    layersSelected: ['issues', 'changes', 'commits'],
    filterCommitsChanges: true,
    filterCommitsChangesCutoff: 1000,
    colorSegments: false,
  },
);
