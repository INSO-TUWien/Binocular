'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_CLONE: (state, action) =>
      _.assign({}, state, { clone: action.payload ? action.payload.fingerprint : null }),

    SET_START_REV: (state, action) => _.assign({}, state, { startRevision: action.payload }),

    SET_END_REV: (state, action) => _.assign({}, state, { endRevision: action.payload }),

    SET_PACKAGE: (state, action) => _.assign({}, state, { package: action.payload }),

    SET_CLONE_TYPE: (state, action) => _.assign({}, state, { cloneType: action.payload })
  },
  {
    clone: null,
    startRevision: null,
    endRevision: null,
    package: null,
    cloneType: 1
  }
);
