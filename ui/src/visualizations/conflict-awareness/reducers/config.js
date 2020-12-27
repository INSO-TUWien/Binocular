'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_COLOR: (state, action) => {
      let colorFromKey = {
        color: {},
      };
      colorFromKey.color[`${action.payload.key}`] = action.payload.color;
      return _.assign({}, state, colorFromKey);
    },
  },
  {
    color: {
      baseProject: '#F17013',
      otherProject: '#0155FE',
      combined: '#188E01',
    },
  }
);
