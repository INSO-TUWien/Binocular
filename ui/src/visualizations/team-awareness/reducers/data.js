'use strict';

import _ from 'lodash';
import { handleActions } from 'redux-actions';

export default handleActions(
  {
    REQUEST_TEAM_AWARENESS_DATA: state => _.assign({}, state, { isFetching: true }),
    RECEIVE_TEAM_AWARENESS_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        lastFetched: Date.now(),
        receivedAt: action.meta.receivedAt
      });
    },
    PROCESS_TEAM_AWARENESS_DATA: (state, action) => _.assign({}, state, { data: _.assign({}, state.data, action.payload) }),
    PROCESS_TEAM_AWARENESS_FILE_BROWSER: (state, action) => _.assign({}, state, { data: _.assign({}, state.data, action.payload) })
  },
  {
    data: {
      files: [],
      fileTree: [],
      branches: [],
      commits: [],
      stakeholders: []
    },
    lastFetched: null,
    isFetching: null
  }
);
