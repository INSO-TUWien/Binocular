'use strict';

import fetch from 'isomorphic-fetch';
import { createAction } from 'redux-actions';
import { reachGraphQL } from 'react-reach';
import { put, select, takeEvery, fork, throttle } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from './utils.js';
import { fetchConfig, watchConfig } from './config.js';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];

export const switchVisualization = createAction('SWITCH_VISUALIZATION', vis => vis);
export const requestCommits = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCommits = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCommitsError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');
export const removeNotification = createAction('REMOVE_NOTIFICATION');
export const addNotification = createAction('ADD_NOTIFICATION');
export const showCommit = createAction('SHOW_COMMIT');

export function* root() {
  yield* fetchConfig();
  yield* fetchCommits();
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
  yield throttle(1000, 'message', fetchCommits);
}

export const fetchCommits = fetchFactory(
  function*() {
    const { config } = yield select();
    return yield reachGraphQL(
      `${config.data.arango.webUrl}_db/pupil-${config.data.repoName}/pupil-ql`,
      `{
         commits {,
           sha,
           date,
           messageHeader
         },
         issues {
           iid,
           title,
           createdAt,
           closedAt,
           webUrl
         }
      }`,
      {}
    );
  },
  requestCommits,
  receiveCommits,
  receiveCommitsError
);
