'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';
import moment from 'moment';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import { getChartColors } from '../../../utils';
import getCommitData from './getCommitData.js';
import getIssueData from './getIssueData.js';
import getBuildData from './getBuildData.js';
import fetchRelatedCommits from './fetchRelatedCommits.js';
import getBounds from './getBounds.js';

export const setResolution = createAction('SET_RESOLUTION');
export const setShowDevs = createAction('SET_SHOW_DEVS');
export const setShowIssues = createAction('SET_SHOW_ISSUES');
export const setSelectedAuthors = createAction('SET_SELECTED_AUTHORS');
export const setAvailableAuthors = createAction('SET_AVAILABLE_AUTHORS');
export const setDisplayMetric = createAction('SET_DISPLAY_METRIC');

export const requestDashboardData = createAction('REQUEST_DASHBOARD_DATA');
export const receiveDashboardData = timestampedActionFactory('RECEIVE_DASHBOARD_DATA');
export const receiveDashboardDataError = createAction('RECEIVE_DASHBOARD_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');
export const setViewport = createAction('COR_SET_VIEWPORT');

export default function*() {
  // fetch data once on entry
  yield* fetchDashboardData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  yield fork(watchOpenCommit);

  // keep looking for viewport changes to re-fetch
  yield fork(watchViewport);
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

export function* watchOpenCommit() {
  yield takeEvery('OPEN_COMMIT', function(a) {
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
  yield takeEvery('REFRESH', fetchDashboardData);
}


export const fetchDashboardData = fetchFactory(
  function*() {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue
      ? Date.parse(firstIssue.createdAt)
      : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.dashboard.state.config.viewport || [0, null];

    const firstSignificantTimestamp = Math.max(
      viewport[0],
      Math.min(firstCommitTimestamp, firstIssueTimestamp)
    );
    const lastSignificantTimestamp = viewport[1]
      ? viewport[1].getTime()
      : Math.max(lastCommitTimestamp, lastIssueTimestamp);

    const span = lastSignificantTimestamp - firstSignificantTimestamp;
    const granularity = getGranularity(span);

    const interval = granularity.interval.asMilliseconds();

    return yield Promise.join(
      getCommitData(
        [firstCommitTimestamp, lastCommitTimestamp],
        [firstSignificantTimestamp, lastSignificantTimestamp],
        granularity,
        interval
      ),
      getIssueData(
        [firstIssueTimestamp, lastIssueTimestamp],
        [firstSignificantTimestamp, lastSignificantTimestamp],
        granularity,
        interval
      ),
      getBuildData(
        [firstCommitTimestamp, lastCommitTimestamp],
        [firstSignificantTimestamp, lastSignificantTimestamp],
        granularity,
        interval
      )
    )
      .spread((commits, issues, builds) => {
        const aggregatedAuthors = _.keys(_.last(commits).statsByAuthor);
        const palette = getChartColors('spectral', [...committers, 'other']);

        return {
          otherCount: committers.length - aggregatedAuthors.length,
          commits,
          committers,
          palette,
          issues,
          builds
        };
      })
      .catch(function(e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestDashboardData,
  receiveDashboardData,
  receiveDashboardDataError
);

function getGranularity(span) {
  const granularities = [
    { interval: moment.duration(1, 'year'), limit: moment.duration(100, 'years') },
    { interval: moment.duration(9, 'month'), limit: moment.duration(100, 'months') },
    { interval: moment.duration(1, 'month'), limit: moment.duration(50, 'months') },
    { interval: moment.duration(1, 'week'), limit: moment.duration(100, 'weeks') },
    { interval: moment.duration(1, 'day'), limit: moment.duration(100, 'day') },
    { interval: moment.duration(1, 'hour'), limit: moment.duration(100, 'hour') }
  ];

  return _.reduce(granularities, (t, g) => {
    if (span < g.limit.asMilliseconds()) {
      return g;
    } else {
      return t;
    }
  });
}
