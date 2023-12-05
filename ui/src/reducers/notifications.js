'use strict';

import { handleActions } from 'redux-actions';
import { notification } from '../sagas/notifications';
import _ from 'lodash';

export default handleActions(
  {
    RECEIVE_CODE_OWNERSHIP_RIVER_DATA_ERROR: (notifications, action) => {
      return [notification(`Error receiving code ownership data: ${action.payload.message}`, 'danger'), ...notifications];
    },

    RECEIVE_ISSUE_IMPACT_DATA_ERROR: (notifications, action) => {
      return [notification(`Error receiving issue-impact data: ${action.payload.message}`, 'danger'), ...notifications];
    },

    RECEIVE_CODE_EXPERTISE_DATA_ERROR: (notifications, action) => {
      return [notification(`Error receiving code expertise data: ${action.payload.message}`, 'danger'), ...notifications];
    },

    ADD_NOTIFICATION: (notifications, action) => {
      return [...notifications, action.payload];
    },

    REMOVE_NOTIFICATION: (notifications, action) => _.filter(notifications, (n) => n.id !== action.payload),
  },
  []
);
