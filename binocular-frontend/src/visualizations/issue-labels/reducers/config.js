'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_CURRENT_BRANCH: (state, action) =>
      _.assign({}, state, {
        currentBranch: action.payload ? action.payload : null,
      }),
    SET_SELECTED_LABELS: (state, action) =>
      _.assign({}, state, {
        selectedLabels: action.payload ? action.payload : [],
      }),
  },
  {
    currentBranch: null,
    selectedLabels: [],
  },
);

export const getConfig = (state) => state.visualizations.issueLabels.state.config;
