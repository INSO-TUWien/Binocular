'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork, throttle, put } from 'redux-saga/effects';

import { fetchConfig, watchConfig } from './config.js';
import { fetchCodeOwnershipData } from './CodeOwnershipRiver.js';
import { fetchIssueImpactData, watchSetActiveIssue } from './IssueImpact.js';
import { watchNotifications } from './notifications.js';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];

export const switchVisualization = createAction('SWITCH_VISUALIZATION', vis => vis);
export const showCommit = createAction('SHOW_COMMIT');

export function* root() {
  yield* fetchConfig();
  yield* refresh();
  yield fork(watchShowCommits);
  yield fork(watchConfig);
  yield fork(watchVisualization);
  yield fork(watchSetActiveIssue);
  yield fork(watchNotifications);
}

function* watchVisualization() {
  yield takeEvery('SWITCH_VISUALIZATION', refresh);
}

function* watchShowCommits() {
  yield takeEvery('SHOW_COMMIT', function*(a) {
    const { config } = yield select();
    window.open(`${config.data.projectUrl}/commit/${a.payload.sha}`);
  });
}

export function* watchMessages() {
  yield throttle(1000, 'message', refresh);
}

export function* refresh() {
  const { activeVisualization } = yield select();

  switch (activeVisualization) {
    case 'CODE_OWNERSHIP_RIVER':
      yield fetchCodeOwnershipData();
      break;

    case 'ISSUE_IMPACT':
      yield fetchIssueImpactData();
      break;
  }
}
