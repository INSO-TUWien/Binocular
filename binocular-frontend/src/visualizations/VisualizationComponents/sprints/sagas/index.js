'use strict';

import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../../sagas/utils';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import { createAction } from 'redux-actions';
import chroma from 'chroma-js';
import _ from 'lodash';
import Database from '../../../../database/database';

export const setColorIssuesMergeRequests = createAction('SET_COLOR_ISSUES_MERGE_REQUESTS');

export const requestSprintsData = createAction('REQUEST_SPRINTS_DATA');
export const receiveSprintsData = timestampedActionFactory('RECEIVE_SPRINTS_DATA');
export const receiveSprintsDataError = createAction('RECEIVE_SPRINTS_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function* () {
  // fetch data once on entry
  yield* fetchSprintsData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  // keep looking for viewport changes to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);

  // keep looking for universal settings changes
  yield fork(watchTimeSpan);
  yield fork(watchSelectedAuthorsGlobal);
  yield fork(watchMergedAuthors);
  yield fork(watchOtherAuthors);
  yield fork(watchSprints);
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchSprintsData);
}

function* watchSelectedAuthorsGlobal() {
  yield takeEvery('SET_SELECTED_AUTHORS_GLOBAL', fetchSprintsData);
}

function* watchOtherAuthors() {
  yield takeEvery('SET_OTHER_AUTHORS', fetchSprintsData);
}

function* watchMergedAuthors() {
  yield takeEvery('SET_MERGED_AUTHORS', fetchSprintsData);
}

function* watchSprints() {
  yield takeEvery('SET_SPRINTS', fetchSprintsData);
}

function* watchRefreshRequests() {
  yield throttle(5000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(fetchSprintsData));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchSprintsData);
}

/**
 * Fetch data for dashboard, this still includes old functions that were copied over.
 */
export const fetchSprintsData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.changes.state.config.viewport || [0, null];
    let firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);
    const timeSpan = state.universalSettings.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();
    return yield Promise.all([
      Database.getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      Database.getMergeRequestData([firstIssueTimestamp, lastIssueTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
    ])
      .then((result) => {
        const issues = result[0];
        const mergeRequests = result[1];
        return {
          otherCount: 0,
          issues,
          mergeRequests,
          firstIssueTimestamp,
          lastIssueTimestamp,
          firstSignificantTimestamp,
          lastSignificantTimestamp,
        };
      })
      .catch(function (e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestSprintsData,
  receiveSprintsData,
  receiveSprintsDataError,
);
