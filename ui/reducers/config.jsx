'use strict';

import { RECEIVE_CONFIGURATION, REQUEST_CONFIGURATION } from '../actions.jsx';
import _ from 'lodash';

const config = (state = { lastFetched: null, isFetching: false }, action) => {

  if( action.type === REQUEST_CONFIGURATION ) {
    return _.assign( {}, state, { isFetching: true } );
  }

  if( action.type === RECEIVE_CONFIGURATION ) {
    return _.merge( {}, state, action.config, {
      isFetching: false,
      lastFetched: action.receivedAt
    } );
  }

  return state;
};

export default config;
