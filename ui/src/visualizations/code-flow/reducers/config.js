'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    CF_ADD_REF: (state, action) => _.assign({}, state, { refs: state.refs.concat([action.payload]) }),
    CF_REMOVE_REF: (state, action) => _.assign({}, state, { refs: state.refs.filter(element => element !== action.payload) }),
    CF_SET_REFS: (state, action) => _.assign({}, state, { refs: action.payload })
  },
  {
    refs: []
  }
);
