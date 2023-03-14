'use strict';

import { handleAction } from 'redux-actions';

export default handleAction(
  'SWITCH_CONFIG_TAB',
  function (state, action) {
    return action.payload;
  },
  'its'
);
