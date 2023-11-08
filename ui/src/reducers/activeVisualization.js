'use strict';

import { handleAction } from 'redux-actions';

export default handleAction(
  'SWITCH_VISUALIZATION',
  function (state, action) {
    localStorage.setItem('previousActiveVisualization', action.payload);
    return action.payload;
  },
  {}
);
