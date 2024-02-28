'use strict';

import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../../sagas/utils';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import { createAction } from 'redux-actions';
import Database from '../../../../database/database';

export const requestBuildData = createAction('REQUEST_BUILD_DATA');
export const receiveBuildData = timestampedActionFactory('RECEIVE_BUILD_DATA');
export const receiveBuildDataError = createAction('RECEIVE_BUILD_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function* () {
  // fetch data once on entry
  yield* fetchBuildsData();

  yield fork(watchRefreshRequests);
  yield fork(watchProgress);

  // keep looking for viewport changes to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);

  // keep looking for universal settings changes
  yield fork(watchTimeSpan);
  yield fork(watchSelectedAuthorsGlobal);
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchBuildsData);
}

function* watchSelectedAuthorsGlobal() {
  yield takeEvery('SET_SELECTED_AUTHORS_GLOBAL', fetchBuildsData);
}

function* watchRefreshRequests() {
  yield throttle(5000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchProgress() {
  yield takeEvery('PROGRESS', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchBuildsData);
}

/**
 * Fetch data for dashboard, this still includes old functions that were copied over.
 */
export const fetchBuildsData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.ciBuilds.state.config.viewport || [0, null];

    let firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);
    const timeSpan = state.universalSettings.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();
    return yield Promise.all([
      Database.getBuildData([firstCommitTimestamp, lastCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      Database.getBuildData([firstCommitTimestamp, lastCommitTimestamp], [0, Date.now()]),
    ])
      .then((results) => {
        const filteredBuilds = results[0];
        const builds = results[1];
        return {
          otherCount: 0,
          filteredBuilds,
          builds,
          firstCommitTimestamp,
          lastCommitTimestamp,
          firstSignificantTimestamp,
          lastSignificantTimestamp,
        };
      })
      .catch(function (e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestBuildData,
  receiveBuildData,
  receiveBuildDataError,
);
