'use strict';

import visualizationRegistry from '../visualizationRegistry';
import { createAction } from 'redux-actions';
import { select, fork, takeEvery } from 'redux-saga/effects';

export const setActiveVisualizations = createAction('SET_ACTIVE_VISUALIZATIONS');
export const refresh = createAction('REFRESH');

export default function* () {
  yield fork(fetchData);
  yield fork(watchRefresh);
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchData);
}

function* fetchData() {
  const state = yield select();
  for (const visualization of state.visualizations.dashboard.state.config.visualizations) {
    const viz = visualizationRegistry[visualization];
    if (viz.saga !== undefined) {
      yield* viz.saga();
    }
  }
}
