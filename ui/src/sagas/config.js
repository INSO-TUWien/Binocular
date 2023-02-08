'use strict';

import { createAction } from 'redux-actions';

import { endpointUrl } from '../utils';
import { fetchFactory, timestampedActionFactory } from './utils.js';
import { put, takeEvery } from 'redux-saga/effects';
import { addNotification } from './notifications.js';

export const requestConfig = createAction('REQUEST_CONFIGURATION');
export const receiveConfig = timestampedActionFactory('RECEIVE_CONFIGURATION');
export const showConfig = createAction('SHOW_CONFIGURATION');
export const hideConfig = createAction('HIDE_CONFIGURATION');
export const switchConfigTab = createAction('SWITCH_CONFIG_TAB', (tab) => tab);
export const confirmConfig = createAction('CONFIRM_CONFIG');

export const fetchConfig = fetchFactory(
  function () {
    return fetch(endpointUrl('config')).then((resp) => resp.json());
  },
  requestConfig,
  receiveConfig
);

export const fetchConfigOffline = fetchFactory(
  function () {
    return {};
  },
  requestConfig,
  receiveConfig
);

export const postConfig = fetchFactory(
  function (config) {
    return fetch(endpointUrl('config'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    }).then((resp) => resp.json());
  },
  requestConfig,
  receiveConfig
);

export function* watchConfig() {
  yield takeEvery('CONFIRM_CONFIG', function* (a) {
    yield* postConfig(a.payload);
    yield put(hideConfig());
    yield put(addNotification('Configuration updated successfully'));
  });
}
