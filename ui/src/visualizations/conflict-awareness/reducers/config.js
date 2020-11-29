'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_COLOR: (state, action) => {
      let colorFromKey = {};
      colorFromKey[`color.${action.payload.key}`] = action.payload.color;
      return _.assign({}, state, colorFromKey);
    },
  },
  {
    color: {
      baseProject: {
        r: '241',
        g: '112',
        b: '19',
        a: '1',
      },
      otherProject: {
        r: '1',
        g: '85',
        b: '254',
        a: '1',
      },
      combined: {
        r: '24',
        g: '142',
        b: '1',
        a: '1',
      },
    },
  }
);
