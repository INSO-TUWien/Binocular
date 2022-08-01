'use strict';

import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../../sagas/utils';
import Promise from 'bluebird';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import { createAction } from 'redux-actions';
import Database from '../../../../database/database';

export const setShowIssues = createAction('SET_SHOW_ISSUES');

export const requestIssueData = createAction('REQUEST_ISSUE_DATA');
export const receiveIssueData = timestampedActionFactory('RECEIVE_ISSUE_DATA');
export const receiveIssueDataError = createAction('RECEIVE_ISSUE_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function* () {
  // fetch data once on entry
  yield* fetchIssuesData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  // keep looking for viewport changes to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);

  // keep looking for universal settings changes
  yield fork(watchTimeSpan);
  yield fork(watchSelectedAuthorsGlobal);
  yield fork(watchAllAuthors);
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchIssuesData);
}

function* watchSelectedAuthorsGlobal() {
  yield takeEvery('SET_SELECTED_AUTHORS_GLOBAL', fetchIssuesData);
}

function* watchAllAuthors() {
  yield takeEvery('SET_ALL_AUTHORS', fetchIssuesData);
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
  yield takeEvery('REFRESH', fetchIssuesData);
}

/**
 * Fetch data for dashboard, this still includes old functions that were copied over.
 */
export const fetchIssuesData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.issues.state.config.viewport || [0, null];

    let firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);
    const timeSpan = state.visualizations.newDashboard.state.config.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();
    return yield Promise.join(
      Database.getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      Database.getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstIssueTimestamp, lastIssueTimestamp])
    )
      .spread((filteredIssues, issues) => {
        return {
          otherCount: 0,
          filteredIssues,
          issues,
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
  requestIssueData,
  receiveIssueData,
  receiveIssueDataError
);
