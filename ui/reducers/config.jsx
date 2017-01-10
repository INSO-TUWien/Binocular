'use strict';

import { RECEIVE_CONFIGURATION, REQUEST_CONFIGURATION } from '../actions.jsx';
import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions( {
  REQUEST_CONFIGURATION: (state, action) => _.assign( {}, state, { isFetching: true } ),

  RECEIVE_CONFIGURATION: (state, action) => _.merge( {}, state, action.payload, {
    isFetching: false,
    receivedAt: action.meta.receivedAt
  } )
}, { lastFetched: null, isFetching: null } );
