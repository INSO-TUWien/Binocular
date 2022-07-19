'use strict';

import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../../sagas/utils';
import getBounds from './getBounds';
import Promise from 'bluebird';
import getBuildData from './getBuildData';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import { createAction } from 'redux-actions';

export const requestBuildData = createAction('REQUEST_BUILD_DATA');
export const receiveBuildData = timestampedActionFactory('RECEIVE_BUILD_DATA');
export const receiveBuildDataError = createAction('RECEIVE_BUILD_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function* () {
  // fetch data once on entry
  yield* fetchBuildsData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  // keep looking for viewport changes to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);

  // keep looking for universal settings changes
  yield fork(watchTimeSpan);
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchBuildsData);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
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
    const { firstCommit, lastCommit, firstIssue, lastIssue } = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.ciBuilds.state.config.viewport || [0, null];

    let firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);
    const timeSpan = state.visualizations.newDashboard.state.config.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();
    return yield Promise.join(
      getBuildData([firstCommitTimestamp, lastCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      getBuildData([firstCommitTimestamp, lastCommitTimestamp], [firstCommitTimestamp, lastCommitTimestamp])
    )
      .spread((filteredBuilds, builds) => {
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
  receiveBuildDataError
);
