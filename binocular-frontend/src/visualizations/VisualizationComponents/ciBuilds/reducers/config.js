'use strict';

import { handleActions } from 'redux-actions';

export default handleActions(
  {},
  {
    chartResolution: 'months', //chart bucket size, can be 'years', 'months', 'weeks' or 'days'
  },
);
