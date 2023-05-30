'use strict';

import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';
import moment from 'moment';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import { getChartColors } from '../../../../utils';
import Database from '../../../../database/database';
import fetchRelatedCommits from './fetchRelatedCommits.js';

export const setOverlay = createAction('SET_OVERLAY');
export const setHighlightedIssue = createAction('SET_HIGHLIGHTED_ISSUE');
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE');
export const openCommit = createAction('OPEN_COMMIT');

export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');
export const setViewport = createAction('COR_SET_VIEWPORT');

export default function* () {
  // fetch data once on entry
  yield* fetchCodeOwnershipData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  yield fork(watchOpenCommit);

  // keep looking for viewport changes to re-fetch
  yield fork(watchViewport);
  yield fork(watchRefresh);
  yield fork(watchHighlightedIssue);
  yield fork(watchToggleHelp);

  // keep looking for universal settings changes
  yield fork(watchTimeSpan);
  yield fork(watchSelectedAuthorsGlobal);
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchCodeOwnershipData);
}
function* watchSelectedAuthorsGlobal() {
  yield takeEvery('SET_SELECTED_AUTHORS_GLOBAL', fetchCodeOwnershipData);
}

function* watchRefreshRequests() {
  yield throttle(5000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

export function* watchOpenCommit() {
  yield takeEvery('OPEN_COMMIT', function (a) {
    window.open(a.payload.webUrl);
  });
}

function* watchViewport() {
  yield takeEvery('COR_SET_VIEWPORT', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchCodeOwnershipData);
}

function* watchHighlightedIssue() {
  yield takeEvery('SET_HIGHLIGHTED_ISSUE', function* (a) {
    return yield fetchRelatedCommits(a.payload);
  });
}

export const fetchCodeOwnershipData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.codeOwnershipRiver.state.config.viewport || [0, null];

    let firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);

    const firstSignificantIssueTimestamp = Math.max(firstSignificantTimestamp, firstIssueTimestamp);
    const lastSignificantIssueTimestamp = Math.min(lastSignificantTimestamp, lastIssueTimestamp);

    const timeSpan = state.universalSettings.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();

    const span = lastSignificantTimestamp - firstSignificantTimestamp;
    const granularity = getGranularity(span);

    const interval = granularity.interval.asMilliseconds();

    return yield Promise.all([
      Database.getCommitDataOwnershipRiver(
        [firstCommitTimestamp, lastCommitTimestamp],
        [firstSignificantTimestamp, lastSignificantTimestamp],
        granularity,
        interval
      ),
      Database.getIssueDataOwnershipRiver(
        [firstIssueTimestamp, lastIssueTimestamp],
        [firstSignificantIssueTimestamp, lastSignificantIssueTimestamp],
        granularity,
        interval
      ),
      Database.getBuildData(
        [firstCommitTimestamp, lastCommitTimestamp],
        [firstSignificantTimestamp, lastSignificantTimestamp],
        granularity,
        interval
      ),
      Database.getCommitDataOwnershipRiver(
        [firstCommitTimestamp, lastCommitTimestamp],
        [firstCommitTimestamp, lastCommitTimestamp],
        granularity,
        interval
      ),
      Database.getIssueDataOwnershipRiver(
        [firstIssueTimestamp, lastIssueTimestamp],
        [firstIssueTimestamp, lastIssueTimestamp],
        granularity,
        interval
      ),
      Database.getBuildData(
        [firstCommitTimestamp, lastCommitTimestamp],
        [firstCommitTimestamp, lastCommitTimestamp],
        granularity,
        interval
      ),
    ])
      .then((results) => {
        const filteredCommits = results[0];
        const filteredIssues = results[1];
        const filteredBuilds = results[2];
        const commits = results[3];
        const issues = results[4];
        const builds = results[5];

        const palette = getChartColors('spectral', [...committers, 'other']);
        return {
          filteredCommits,
          commits,
          committers,
          palette,
          filteredIssues,
          issues,
          filteredBuilds,
          builds,
        };
      })
      .catch(function (e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);

function getGranularity(span) {
  const granularities = [
    { interval: moment.duration(1, 'year'), limit: moment.duration(100, 'years') },
    { interval: moment.duration(9, 'month'), limit: moment.duration(100, 'months') },
    { interval: moment.duration(1, 'month'), limit: moment.duration(50, 'months') },
    { interval: moment.duration(1, 'week'), limit: moment.duration(100, 'weeks') },
    { interval: moment.duration(1, 'day'), limit: moment.duration(100, 'day') },
    { interval: moment.duration(1, 'hour'), limit: moment.duration(100, 'hour') },
  ];

  return _.reduce(granularities, (t, g) => {
    if (span < g.limit.asMilliseconds()) {
      return g;
    } else {
      return t;
    }
  });
}
