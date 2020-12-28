'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    // a color of a project was changed via a ColorPicker
    SET_COLOR: (state, action) => {
      let colorFromKey = {
        color: {},
      };
      colorFromKey.color[`${action.payload.key}`] = action.payload.color;
      return _.assign({}, state, colorFromKey);
    },
    // a (new) project/fork was selected
    SET_OTHER_PROJECT: (state, action) => {
      return _.assign({}, state, { otherProject: action.payload });
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
