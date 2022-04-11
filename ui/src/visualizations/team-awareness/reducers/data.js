'use strict';

import _ from 'lodash';
import { handleActions } from 'redux-actions';

export default handleActions(
  {
    REQUEST_TEAM_AWARENESS_DATA: state => {
      return _.assign({}, state, { isFetching: true });
    },
    RECEIVE_TEAM_AWARENESS_DATA: (state, action) => {
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        lastFetched: Date.now(),
        receivedAt: action.meta.receivedAt
      });
    },
    PROCESS_TEAM_AWARENESS_DATA: (state, action) => {
      console.log('PROCESS_TEAM_AWARENESS_DATA', state, action);
      return _.assign({}, state, {
        data: {
          commits: state.data.commits,
          stakeholders: action.payload.stakeholders,
          activityTimeline: action.payload.activityTimeline,
          dataBoundaries: action.payload.dataBoundaries
        }
      });
    }
  },
  {
    data: {
      commits: [],
      stakeholders: []
    },
    lastFetched: null,
    isFetching: null
  }
);
