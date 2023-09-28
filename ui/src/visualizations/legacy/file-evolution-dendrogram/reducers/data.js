'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    REQUEST_FILE_EVOLUTION_DENDROGRAM_DATA: (state) => _.assign({}, state, { isFetching: true }),
    RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA: (state, action) => {
      console.log("reducer data");
      console.log(action);
      console.log(state);
      console.log(_.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      }));
      return _.assign({}, state, {
        data: action.payload,
        isFetching: false,
        receivedAt: action.meta.receivedAt,
      });
    },
  },
  {
    data: {
      fileURL: '',
      branch: 'master',
      files: [],
      branches: [],
      path: '',
    },
    lastFetched: null,
    isFetching: null,
  }
);
