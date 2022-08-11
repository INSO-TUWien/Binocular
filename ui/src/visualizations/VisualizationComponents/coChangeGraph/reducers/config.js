'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_NAVIGATION_MODE: (state, action) => _.assign({}, state, { navigationMode: action.payload }),
  },
  {
    navigationMode: 'pan',
  }
);
