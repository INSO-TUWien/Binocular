'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';

export const setActiveFile = createAction('SET_ACTIVE_FILE', f => f);
export const setActiveBranch = createAction('SET_ACTIVE_BRANCH', b => b);

export const requestCodeHotspotsData = createAction('REQUEST_CODE_HOTSPOTS_DATA');
export const receiveCodeHotspotsData = timestampedActionFactory('RECEIVE_CODE_HOTSPOTS_DATA');
export const receiveCodeHotspotsDataError = createAction('RECEIVE_CODE_HOTSPOTS_DATA_ERROR');


export default function*() {
  yield fork(watchSetActiveFile);
}

export function* watchSetActiveFile() {
  yield takeEvery('SET_ACTIVE_FILE', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_BRANCH', fetchFileUrl);

}

export const fetchFileUrl = fetchFactory(
  function*() {

    const state = yield select();
    const fileURL = state.visualizations.codeHotspots.state.config.fileURL;
    const branch = state.visualizations.codeHotspots.state.config.branch;

    return {fileURL,branch}
    },
  requestCodeHotspotsData,
  receiveCodeHotspotsData,
  receiveCodeHotspotsDataError
);

