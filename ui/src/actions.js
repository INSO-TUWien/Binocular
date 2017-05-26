'use strict';

import Promise from 'bluebird';
import fetch from 'isomorphic-fetch';
import { endpointUrl } from './utils.js';
import { createAction } from 'redux-actions';
import { reachGraphQL } from 'react-reach';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];

export const switchVisualization = createAction('SWITCH_VISUALIZATION', vis => vis);
export const showConfig = createAction('SHOW_CONFIGURATION');
export const hideConfig = createAction('HIDE_CONFIGURATION');
export const requestConfig = createAction('REQUEST_CONFIGURATION');
export const receiveConfig = timestampedActionFactory('RECEIVE_CONFIGURATION');
export const requestCommits = createAction('REQUEST_COMMITS');
export const receiveCommits = timestampedActionFactory('RECEIVE_COMMITS');
export const receiveCommitsError = createAction('RECEIVE_COMMITS_ERROR');
export const removeNotification = createAction('REMOVE_NOTIFICATION');
export const addNotification = createAction('ADD_NOTIFICATION');

export function postConfig(config) {
  return function(dispatch) {
    dispatch(requestConfig());

    return Promise.resolve(
      fetch(endpointUrl('config'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })
    )
      .then(resp => resp.json())
      .then(json => dispatch(receiveConfig(json)));
  };
}

export const fetchConfig = fetchFactory('config', requestConfig, receiveConfig);
// export const fetchCommits = fetchFactory( 'commits', requestCommits, receiveCommits, receiveCommitsError );

export const fetchCommits = makeThunk(
  function() {
    return reachGraphQL(
      'http://localhost:8529/_db/pupil/pupil-ql',
      `{
       commits {
         sha
         message
         signature
         date
       }
     }`,
      {}
    );
  },
  requestCommits,
  receiveCommits,
  receiveCommitsError
);

function timestampedActionFactory(action) {
  return createAction(action, id => id, () => ({ receivedAt: new Date() }));
}

function makeThunk(fn, requestActionCreator, receiveActionCreator, errorActionCreator) {
  return function() {
    return function(dispatch) {
      dispatch(requestActionCreator());

      let ret = Promise.resolve( fn(dispatch) ).tap(result => {
        dispatch(receiveActionCreator(result));
      });

      if (errorActionCreator) {
        ret = ret.catch(e => dispatch(errorActionCreator(e)));
      }

      return ret;
    };
  };
}

function fetchFactory(endpoint, requestActionCreator, receiveActionCreator, errorActionCreator) {
  return function() {
    return function(dispatch) {
      dispatch(requestActionCreator());

      let ret = Promise.resolve(fetch(endpointUrl(endpoint)))
        .then(resp => resp.json())
        .then(json => dispatch(receiveActionCreator(json)));

      if (errorActionCreator) {
        ret = ret.catch(e => dispatch(errorActionCreator(e)));
      }

      return ret;
    };
  };
}
