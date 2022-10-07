'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_TIME_SPAN: (state, action) => _.assign({}, state, { chartTimeSpan: action.payload }),
    SET_PATH_FILTER: (state, action) => _.assign({}, state, { pathFilter: action.payload })
  },
  {
    chartTimeSpan: {from: undefined, to: undefined},
    pathFilter: undefined
  }
);
