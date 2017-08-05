'use strict';

import { createAction } from 'redux-actions';

import { endpointUrl } from '../utils.js';
import { fetchFactory, timestampedActionFactory } from './utils.js';
import { put, takeEvery } from 'redux-saga/effects';

export const requestConfig = createAction('REQUEST_CONFIGURATION');
export const receiveConfig = timestampedActionFactory('RECEIVE_CONFIGURATION');
export const showConfig = createAction('SHOW_CONFIGURATION');
export const hideConfig = createAction('HIDE_CONFIGURATION');
export const switchConfigTab = createAction('SWITCH_CONFIG_TAB', tab => tab);
export const confirmConfig = createAction('CONFIRM_CONFIG');

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

    const json = yield resp.json();

    return json;
  },
  requestConfig,
  receiveConfig
);

export function* watchConfig() {
  yield takeEvery('CONFIRM_CONFIG', function*(a) {
    yield* postConfig(a.payload);
    yield put(hideConfig());
  });
}
