'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SHOW_CONFIGURATION: state => _.assign({}, state, { isShown: true }),

    HIDE_CONFIGURATION: state => _.assign({}, state, { isShown: false }),

    REQUEST_CONFIGURATION: state => _.assign({}, state, { isFetching: true }),

    RECEIVE_CONFIGURATION: (state, action) => {
      document.title = 'Binocular (Offline Artifact)';
      return _.merge({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt
      });
    }
  },
  { lastFetched: null, isFetching: null }
);
