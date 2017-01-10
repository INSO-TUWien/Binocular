'use strict';

import Promise from 'bluebird';
import fetch from 'isomorphic-fetch';
import { endpointUrl } from './utils.jsx';
import { createAction } from 'redux-actions';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];

export const switchVisualization = createAction( 'SWITCH_VISUALIZATION', vis => vis );
export const showConfig = createAction( 'SHOW_CONFIGURATION' );
export const hideConfig = createAction( 'HIDE_CONFIGURATION' );
export const requestConfig = createAction( 'REQUEST_CONFIGURATION' );
export const receiveConfig = createAction(
  'RECEIVE_CONFIGURATION',
  config => config,
  () => ({ receivedAt: new Date() })
);

export function postConfig( config ) {
  return function( dispatch ) {
    dispatch( requestConfig() );

    return Promise.resolve( fetch( endpointUrl('config'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    } ) )
    .then( resp => resp.json() )
    .then( json => dispatch(receiveConfig(json)) );
  };
}

export function fetchConfig() {
  return function( dispatch ) {
    dispatch( requestConfig() );

    return Promise.resolve( fetch(endpointUrl('config')) )
    .then( resp => resp.json() )
    .then( json => dispatch(receiveConfig(json)) );
  };
}
