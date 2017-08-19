'use strict';

import fetch from 'isomorphic-fetch';
import { createAction } from 'redux-actions';
import { reachGraphQL } from 'react-reach';
import { put, select, takeEvery, fork, throttle } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from './utils.js';
import { fetchConfig, watchConfig } from './config.js';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];

export const switchVisualization = createAction('SWITCH_VISUALIZATION', vis => vis);
export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');
export const removeNotification = createAction('REMOVE_NOTIFICATION');
export const addNotification = createAction('ADD_NOTIFICATION');
export const showCommit = createAction('SHOW_COMMIT');

export function* root() {
  yield* fetchConfig();
  yield* fetchCodeOwnershipData();
  yield fork(watchShowCommits);
  yield fork(watchMessages);
  yield fork(watchConfig);
}

function* watchShowCommits() {
  yield takeEvery('SHOW_COMMIT', function*(a) {
    const { config } = yield select();
    window.open(`${config.data.projectUrl}/commit/${a.payload.sha}`);
  });
}

export function* watchMessages() {
  yield throttle(1000, 'message', fetchCodeOwnershipData);
}

export const fetchCodeOwnershipData = fetchFactory(
  function*() {
    const { config } = yield select();

    return yield reachGraphQL(
      `${config.data.arango.webUrl}_db/pupil-${config.data.repoName}/pupil-ql`,
      `{
         commits {,
           sha,
           date,
           messageHeader,
           signature,
           stats {
             additions,
             deletions
           }
         },
         issues {
           iid,
           title,
           createdAt,
           closedAt,
           webUrl,
           mentions
         }
      }`,
      {}
    ).catch(function(e) {
      console.warn(e);
      throw new Error('Error querying GraphQl');
    });
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);
