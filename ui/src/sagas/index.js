'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork, cancel } from 'redux-saga/effects';

import { fetchConfig, fetchConfigOffline, watchConfig } from './config.js';
import { fetchUniversalSettingsData } from './universalSettings';
import { watchNotifications } from './notifications.js';
import Database from '../database/database';

export const switchVisualization = createAction('SWITCH_VISUALIZATION', (vis) => vis);
export const toggleHelp = createAction('TOGGLE_HELP');

export const setTimeSpan = createAction('SET_TIME_SPAN');
export const setSelectedAuthors = createAction('SET_SELECTED_AUTHORS_GLOBAL');
export const setAllAuthors = createAction('SET_All_AUTHORS');
export const setMergedAuthorList = createAction('SET_MERGED_AUTHOR_LIST');
export const setOtherAuthorList = createAction('SET_OTHER_AUTHOR_LIST');
export const setResolution = createAction('SET_RESOLUTION');

let currentComponentSaga = null;

function* switchComponentSaga(visualizationName) {
  if (currentComponentSaga) {
    yield cancel(currentComponentSaga);
  }

  const { visualizations } = yield select();
  currentComponentSaga = yield fork(visualizations[visualizationName].saga);
}

export function* root() {
  Database.checkBackendConnection().then(function* (resp) {
    if (resp) {
      yield* fetchConfig();
    } else {
      yield* fetchConfigOffline();
    }
  });
  yield* fetchUniversalSettingsData();
  const { activeVisualization } = yield select();
  yield* switchComponentSaga(activeVisualization);
  yield fork(watchConfig);
  yield fork(watchVisualization);
  yield fork(watchNotifications);
}

function* watchVisualization() {
  yield takeEvery('SWITCH_VISUALIZATION', function* () {
    const { activeVisualization } = yield select();
    yield switchComponentSaga(activeVisualization);
  });
}
