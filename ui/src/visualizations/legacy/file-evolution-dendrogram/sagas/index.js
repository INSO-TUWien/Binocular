'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils.js';
import Database from '../../../../database/database';
import BluebirdPromise from 'bluebird';


export const setActiveFile = createAction('SET_ACTIVE_FILE', (f) => f);
export const setActivePath = createAction('SET_ACTIVE_PATH', (p) => p);
export const setActiveBranch = createAction('SET_ACTIVE_BRANCH', (b) => b);
export const setActiveFiles = createAction('SET_ACTIVE_FILES', (f) => f);
export const setActiveBranches = createAction('SET_ACTIVE_BRANCHES', (b) => b);

export const requestFileEvolutionDendrogramData = createAction('REQUEST_FILE_EVOLUTION_DENDROGRAM_DATA');
export const receiveFileEvolutionDendrogramData = timestampedActionFactory('RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA');
export const receiveFileEvolutionDendrogramDataError = createAction('RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA_ERROR');

export default function* () {      
  // fetch data once on entry
  yield* fetchFileUrl();                                                                       
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
    const fileURL = state.visualizations.fileEvolutionDendrogram.state.config.fileURL;
    const branch = state.visualizations.fileEvolutionDendrogram.state.config.branch;
    const path = state.visualizations.fileEvolutionDendrogram.state.config.path;
    const files = [];
    BluebirdPromise.resolve(Database.requestFileStructure()).then((resp) => resp.files.data).then(function (resp) {
      for (const i in resp) {
        files.push({ key: resp[i].path, webUrl: resp[i].webUrl });
      }
    });
    const branches = state.visualizations.fileEvolutionDendrogram.state.config.branches;
    console.log("saga");
    console.log(state);
    console.log(files);

    return { fileURL, branch, files, path, branches };
  },
  requestFileEvolutionDendrogramData,
  receiveFileEvolutionDendrogramData,
  receiveFileEvolutionDendrogramDataError
);
