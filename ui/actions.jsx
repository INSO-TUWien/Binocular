'use strict';

import Promise from 'bluebird';
import fetch from 'isomorphic-fetch';
import { endpointUrl } from './utils.jsx';

export const SWITCH_VISUALIZATION = 'SWITCH_VISUALIZATION';
export const SHOW_CONFIGURATION = 'SHOW_CONFIGURATION';
export const REQUEST_CONFIGURATION = 'REQUEST_CONFIGURATION';
export const RECEIVE_CONFIGURATION = 'RECEIVE_CONFIGURATION';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];


export function switchVisualization( vis ) {
  return { type: SWITCH_VISUALIZATION, id: vis };
}

export function showConfig() {
  return { type: SHOW_CONFIGURATION };
}

export function requestConfig() {
  return { type: REQUEST_CONFIGURATION };
}

export function receiveConfig( config ) {
  return {
    type: RECEIVE_CONFIGURATION,
    config,
    receivedAt: new Date()
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
