'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork, cancel } from 'redux-saga/effects';

import { fetchConfig, watchConfig } from './config.js';
import { watchNotifications } from './notifications.js';

import codeOwnershipRiver from '../visualizations/code-ownership-river/sagas';
import issueImpact from '../visualizations/issue-impact/sagas';
import hotspotDials from '../visualizations/hotspot-dials/sagas';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];

export const switchVisualization = createAction('SWITCH_VISUALIZATION', vis => vis);
export const showCommit = createAction('SHOW_COMMIT');

const componentSagas = {
  CODE_OWNERSHIP_RIVER: codeOwnershipRiver,
  ISSUE_IMPACT: issueImpact,
  HOTSPOT_DIALS: hotspotDials
};
let currentComponentSaga = null;

function* switchComponentSaga(sagaName) {
  if (currentComponentSaga) {
    yield cancel(currentComponentSaga);
  }

  currentComponentSaga = yield fork(componentSagas[sagaName]);
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
