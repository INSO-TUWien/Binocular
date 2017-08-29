'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

let nextId = 0;

export default handleActions(
  {
    RECEIVE_CODE_OWNERSHIP_DATA_ERROR: (notifications, action) => {
      return [
        notification('danger', `Error receiving code ownership data: ${action.payload.message}`),
        ...notifications
      ];
    },

    ADD_NOTIFICATION: (notifications, action) => {
      return [...notifications, notification(action.payload.type, action.payload.message)];
    },

    REMOVE_NOTIFICATION: (notifications, action) =>
      _.filter(notifications, n => n.id !== action.payload)
  },
  []
);

function notification(type, message) {
  return { id: nextId++, type, message };
}
