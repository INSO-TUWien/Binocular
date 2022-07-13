'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_RESOLUTION: (state, action) => _.assign({}, state, { chartResolution: action.payload }),
    SET_TIME_SPAN: (state, action) => _.assign({}, state, { chartTimeSpan: action.payload }),
  },
  {
    chartResolution: 'months', //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
    chartTimeSpan: { from: undefined, to: undefined },
  }
);
