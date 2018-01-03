'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork, cancel } from 'redux-saga/effects';

import { fetchConfig, watchConfig } from './config.js';
import { watchNotifications } from './notifications.js';

export const switchVisualization = createAction('SWITCH_VISUALIZATION', vis => vis);
export const showCommit = createAction('SHOW_COMMIT');

let currentComponentSaga = null;

function* switchComponentSaga(visualizationName) {
  if (currentComponentSaga) {
    yield cancel(currentComponentSaga);
  }

  const { visualizations } = yield select();
  currentComponentSaga = yield fork(visualizations[visualizationName].saga);
}

export function* root() {
  yield* fetchConfig();

  const { activeVisualization } = yield select();
  yield* switchComponentSaga(activeVisualization);
  yield fork(watchShowCommits);
  yield fork(watchConfig);
  yield fork(watchVisualization);
  yield fork(watchNotifications);
}

function* watchVisualization() {
  yield takeEvery('SWITCH_VISUALIZATION', function*() {
    const { activeVisualization } = yield select();
    yield switchComponentSaga(activeVisualization);
  });
}

function* watchShowCommits() {
  yield takeEvery('SHOW_COMMIT', function*(a) {
    const { config } = yield select();
    window.open(`${config.data.projectUrl}/commit/${a.payload.sha}`);
  });
}
