'use strict';

import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import Database from '../../../../database/database';
import { getChartColors } from '../../../../utils';


export const setActiveFile = createAction('SET_ACTIVE_FILE', (f) => f);
export const setActivePath = createAction('SET_ACTIVE_PATH', (p) => p);
export const setActiveBranch = createAction('SET_ACTIVE_BRANCH', (b) => b);
export const setActiveFiles = createAction('SET_ACTIVE_FILES', (f) => f);
export const setActiveBranches = createAction('SET_ACTIVE_BRANCHES', (b) => b);
export const setDisplayByAuthors = createAction('SET_DISPLAY_BY_AUTHORS', (a) => a);
export const setDisplayMetric = createAction('SET_DISPLAY_METRIC', (m) => m);

export const requestFileEvolutionDendrogramData = createAction('REQUEST_FILE_EVOLUTION_DENDROGRAM_DATA');
export const receiveFileEvolutionDendrogramData = timestampedActionFactory('RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA');
export const receiveFileEvolutionDendrogramDataError = createAction('RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA_ERROR');

export default function* () {      
  // fetch data once on entry
  yield* fetchFileEvolutionDendrogramData();                                                                       
  yield fork(watchSetActiveFile);
}

export function* watchSetActiveFile() {
  yield takeEvery('SET_ACTIVE_FILE', fetchFileEvolutionDendrogramData);
  yield takeEvery('SET_ACTIVE_BRANCH', fetchFileEvolutionDendrogramData);
  yield takeEvery('SET_ACTIVE_PATH', fetchFileEvolutionDendrogramData);
  yield takeEvery('SET_ACTIVE_FILES', fetchFileEvolutionDendrogramData);
  yield takeEvery('SET_ACTIVE_BRANCHES', fetchFileEvolutionDendrogramData);
}

export const fetchFileEvolutionDendrogramData = fetchFactory(
  function* () {
    const files = [];
    yield Promise.resolve(Database.getFileDataFileEvolutionDendrogram())
    .then(function (resp) {
      for (const i in resp) {
        files.push({ key: resp[i].path, webUrl: resp[i].webUrl, totalStats: resp[i].totalStats,
          authorMostLinesChanged: resp[i].authorMostLinesChanged, authorMostCommits: resp[i].authorMostCommits  });
      }
    });

    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);
    const palette = getChartColors('spectral', [...committers, 'other']);

    return { 
      files,
      committers,
      palette,
     };
  },
  requestFileEvolutionDendrogramData,
  receiveFileEvolutionDendrogramData,
  receiveFileEvolutionDendrogramDataError
);
