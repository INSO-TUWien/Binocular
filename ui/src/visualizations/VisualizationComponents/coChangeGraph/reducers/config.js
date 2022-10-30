'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_TIME_SPAN: (state, action) => _.assign({}, state, { chartTimeSpan: action.payload }),
    SET_ENTITY_SELECTION: (state, action) => _.assign({}, state, { entitySelection: action.payload }),
    SET_SHOW_INTRA_MODULE_DEPS: (state, action) => _.assign({}, state, { showIntraModuleDeps: action.payload }),
  },
  {
    chartTimeSpan: {from: undefined, to: undefined},
    entitySelection: "files",
    showIntraModuleDeps: true
  }
);
