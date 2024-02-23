'use strict';

import { createAction } from 'redux-actions';
import { select, fork, takeEvery } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils.js';
import Database from '../../../../database/database';
import { getChartColors } from '../../../../utils';


export const setActiveBranch = createAction('SET_ACTIVE_BRANCH', (b) => b);
export const setDisplayByAuthors = createAction('SET_DISPLAY_BY_AUTHORS', (a) => a);
export const setDisplayMetric = createAction('SET_DISPLAY_METRIC', (m) => m);
export const setTimeSpan = createAction('SET_TIME_SPAN', (t) => t);

export const requestFileEvolutionDendrogramData = createAction('REQUEST_FILE_EVOLUTION_DENDROGRAM_DATA');
export const receiveFileEvolutionDendrogramData = timestampedActionFactory('RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA');
export const receiveFileEvolutionDendrogramDataError = createAction('RECEIVE_FILE_EVOLUTION_DENDROGRAM_DATA_ERROR');

export default function* () {      
  // fetch data once on entry
  yield* fetchFileEvolutionDendrogramData();                                                                       
  yield fork(watchSetNewFileTree);
}

export function* watchSetNewFileTree() {
  yield takeEvery('SET_ACTIVE_BRANCH', fetchFileEvolutionDendrogramData);
  yield takeEvery('SET_TIME_SPAN', fetchFileEvolutionDendrogramData);
}

export const fetchFileEvolutionDendrogramData = fetchFactory(
  function* () {
    const state = yield select();
    const activeBranch = state.visualizations.fileEvolutionDendrogram.state.config.branch;
    const timeSpan = state.visualizations.fileEvolutionDendrogram.state.config.timeSpan;
    let branches = [];
    yield Database.getAllBranches()
    .then(function (branchesData) {
      branches = branchesData.branches.data;
    });

    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);
    const palette = getChartColors('spectral', [...committers, 'other']);

    if (timeSpan.from === '') {
      timeSpan.from = firstCommitTimestamp;
    }
    if (timeSpan.to === '') {
      timeSpan.to = lastCommitTimestamp;
    }

    const files = [];
    yield Promise.resolve(Database.getFileDataFileEvolutionDendrogram(activeBranch, timeSpan.from, timeSpan.to))
    .then(function (resp) {
      for (const i in resp) {
        files.push({ key: resp[i].path, webUrl: resp[i].webUrl, totalStats: resp[i].totalStats,
          authorMostLinesChanged: resp[i].authorMostLinesChanged, authorMostCommits: resp[i].authorMostCommits });
      }
    });

    return { 
      files,
      committers,
      palette,
      branches,
     };
  },
  requestFileEvolutionDendrogramData,
  receiveFileEvolutionDendrogramData,
  receiveFileEvolutionDendrogramDataError
);
