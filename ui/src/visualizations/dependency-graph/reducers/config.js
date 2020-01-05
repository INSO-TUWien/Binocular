'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_DEPTH: (state, action) => _.assign({}, state, { depth: parseInt(action.payload, 10) })
  },
  {
    depth: 1
  }
);
