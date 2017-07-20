'use strict';

import fetch from 'isomorphic-fetch';
import { endpointUrl } from './utils.js';
import { createAction } from 'redux-actions';
import { reachGraphQL } from 'react-reach';
import { put, select, takeEvery, fork } from 'redux-saga/effects';

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
export const switchConfigTab = createAction('SWITCH_CONFIG_TAB', tab => tab);
export const showCommit = createAction('SHOW_COMMIT');
export const saveConfig = createAction('SAVE_CONFIG');

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

function* watchConfig() {
  yield takeEvery('SAVE_CONFIG', postConfig);
}

export function* watchMessages() {
  yield takeEvery('message', fetchCommits);
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
      }
    }`,
      {}
    );
  },
  requestCommits,
  receiveCommits,
  receiveCommitsError
);

export const fetchConfig = fetchFactory(
  function*() {
    const resp = yield fetch(endpointUrl('config'));
    return yield resp.json();
  },
  requestConfig,
  receiveConfig
);
export const postConfig = fetchFactory(
  function*(config) {
    const resp = yield fetch(endpointUrl('config'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    return resp.json();
  },
  requestConfig,
  receiveConfig
);

function fetchFactory(fn, requestActionCreator, receiveActionCreator, errorActionCreator) {
  return function*(...args) {
    yield put(requestActionCreator());
    try {
      const result = yield* fn(...args);
      yield put(receiveActionCreator(result));
    } catch (e) {
      if (errorActionCreator) {
        yield put(errorActionCreator(e));
      } else {
        throw e;
      }
    }
  };
}

function timestampedActionFactory(action) {
  return createAction(action, id => id, () => ({ receivedAt: new Date() }));
}
