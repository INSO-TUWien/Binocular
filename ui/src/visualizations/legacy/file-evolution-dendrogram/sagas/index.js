'use strict';

import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import Database from '../../../../database/database';


export const setActiveFile = createAction('SET_ACTIVE_FILE', (f) => f);
export const setActivePath = createAction('SET_ACTIVE_PATH', (p) => p);
export const setActiveBranch = createAction('SET_ACTIVE_BRANCH', (b) => b);
export const setActiveFiles = createAction('SET_ACTIVE_FILES', (f) => f);
export const setActiveBranches = createAction('SET_ACTIVE_BRANCHES', (b) => b);

export const requestFileEvolutionDendrogramData = createAction('REQUEST_FILE_EVOLUTION_DENDROGRAM_DATA');
export const receiveFileEvolutionDendrogramData = timestampedActionFactory('RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA');
export const receiveFileEvolutionDendrogramDataError = createAction('RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA_ERROR');

/*
// for zoom
export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

// for zoom
export const setViewport = createAction('COR_SET_VIEWPORT');
*/

export default function* () {      
  // fetch data once on entry
  yield* fetchFileUrl();                                                                       
  yield fork(watchSetActiveFile);
  /*
  // for zoom
  yield fork(watchViewport);
  yield fork(watchRefresh);
  yield fork(watchRefreshRequests);
  */
}

export function* watchSetActiveFile() {
  yield takeEvery('SET_ACTIVE_FILE', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_BRANCH', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_PATH', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_FILES', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_BRANCHES', fetchFileUrl);
}

/*
// for zoom
function* watchViewport() {
  yield takeEvery('COR_SET_VIEWPORT', mapSaga(requestRefresh));
}

function* watchRefreshRequests() {
  yield throttle(5000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchFileUrl);
}
*/

export const fetchFileUrl = fetchFactory(
  function* () {
    const state = yield select();
    // for zoom
    //const viewport = state.visualizations.fileEvolutionDendrogram.state.config.viewport || [0, null];
    const files = [];
    yield Promise.resolve(Database.requestFileStructure())
    .then((resp) => resp.files.data)
    .then(function (resp) {
      for (const i in resp) {
        files.push({ key: resp[i].path, webUrl: resp[i].webUrl });
      }
    });

    return { files };
  },
  requestFileEvolutionDendrogramData,
  receiveFileEvolutionDendrogramData,
  receiveFileEvolutionDendrogramDataError
);
