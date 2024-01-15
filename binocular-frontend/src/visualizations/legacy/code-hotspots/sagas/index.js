'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils.ts';

export const setActiveFile = createAction('SET_ACTIVE_FILE', (f) => f);
export const setActivePath = createAction('SET_ACTIVE_PATH', (p) => p);
export const setActiveBranch = createAction('SET_ACTIVE_BRANCH', (b) => b);
export const setActiveFiles = createAction('SET_ACTIVE_FILES', (f) => f);
export const setActiveBranches = createAction('SET_ACTIVE_BRANCHES', (b) => b);

export const requestCodeHotspotsData = createAction('REQUEST_CODE_HOTSPOTS_DATA');
export const receiveCodeHotspotsData = timestampedActionFactory('RECEIVE_CODE_HOTSPOTS_DATA');
export const receiveCodeHotspotsDataError = createAction('RECEIVE_CODE_HOTSPOTS_DATA_ERROR');

export default function* () {
  yield fork(watchSetActiveFile);
}

export function* watchSetActiveFile() {
  yield takeEvery('SET_ACTIVE_FILE', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_BRANCH', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_PATH', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_FILES', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_BRANCHES', fetchFileUrl);
}

export const fetchFileUrl = fetchFactory(
  function* () {
    const state = yield select();
    const fileURL = state.visualizations.codeHotspots.state.config.fileURL;
    const branch = state.visualizations.codeHotspots.state.config.branch;
    const path = state.visualizations.codeHotspots.state.config.path;
    const files = state.visualizations.codeHotspots.state.config.files;
    const branches = state.visualizations.codeHotspots.state.config.branches;

    return { fileURL, branch, files, path, branches };
  },
  requestCodeHotspotsData,
  receiveCodeHotspotsData,
  receiveCodeHotspotsDataError,
);
