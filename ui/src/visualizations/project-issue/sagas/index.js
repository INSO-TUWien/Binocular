'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import getCommitData from './getCommitData.js';
import getIssuesCommitData from './getIssueCommitData.js';
import getIssueData from './getIssueData.js';
import getBuildData from './getBuildData.js';
import getBounds from './getBounds.js';
import chroma from 'chroma-js';

export const setResolution = createAction('SET_RESOLUTION');
export const setShowIssues = createAction('SET_SHOW_ISSUES');
export const setSelectedIssues = createAction('SET_SELECTED_ISSUES');
export const setDisplayMetric = createAction('SET_DISPLAY_METRIC');
export const setShowNormalizedChart = createAction('SET_SHOW_NORMALIZED_CHART');
export const setShowStandardChart = createAction('SET_SHOW_STANDARD_CHART');
export const setShowMilestoneChart = createAction('SET_SHOW_MILESTONE_CHART');

export const openCommit = createAction('OPEN_COMMIT');

export const requestProjectIssueData = createAction('REQUEST_PROJECT_ISSUE_DATA');
export const receiveProjectIssueData = timestampedActionFactory('RECEIVE_PROJECT_ISSUE_DATA');
export const receiveProjectIssueDataError = createAction('RECEIVE_PROJECT_ISSUE_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
export const setViewport = createAction('COR_SET_VIEWPORT');

const refresh = createAction('REFRESH');

export default function*() {
  // fetch data once on entry
  yield* fetchProjectIssueData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  yield fork(watchOpenCommit);

  // keep looking for viewport changes to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);
}

export function* watchOpenCommit() {
  yield takeEvery('OPEN_COMMIT', openByWebUrl);
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
  yield takeEvery('REFRESH', fetchProjectIssueData);
}

function openByWebUrl(action) {
  window.open(action.payload.webUrl);
}

/**
 * Fetch data for ProjectIssue, this still includes old functions that were copied over.
 */
export const fetchProjectIssueData = fetchFactory(
  function*() {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueCommitTimestamp = Date.parse(firstCommit.date);
    const lastIssueCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.projectIssue.state.config.viewport || [0, null];

    const firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    const lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);
    return yield Promise.join(
      getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      getIssuesCommitData([firstIssueCommitTimestamp, lastIssueCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      getBuildData()
    )
      .spread((commits, issues, issueCommits, builds) => {
        const palette = getPalette(issues, 20, 20);

        return {
          otherCount: 0,
          commits,
          committers,
          palette,
          issues,
          builds,
          firstSignificantTimestamp,
          lastSignificantTimestamp,
          issueCommits
        };
      })
      .catch(function(e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestProjectIssueData,
  receiveProjectIssueData,
  receiveProjectIssueDataError
);

function getPalette(issues, maxNumberOfColors, numOfIssues) {
  function chartColors(band, maxLength, length) {
    const len = length > maxLength ? maxLength : length;
    return chroma.scale(band).mode('lch').colors(len);
  }

  const palette = chartColors('spectral', maxNumberOfColors, numOfIssues);

  const totals = {};
  _.each(issues, issue => {
    const changes = 1;
    if (totals[issue.signature]) {
      totals[issue.title] += changes;
    } else {
      totals[issue.signature] = changes;
    }
  });

  const sortable = [];
  _.each(Object.keys(totals), key => {
    sortable.push([key, totals[key]]);
  });

  sortable.sort((a, b) => {
    return b[1] - a[1];
  });

  const returnPalette = {};

  for (let i = 0; i < palette.length - 1; i++) {
    returnPalette[sortable[i][0]] = palette[i];
  }
  if (sortable.length > maxNumberOfColors) {
    returnPalette['others'] = palette[maxNumberOfColors - 1];
  } else if (sortable.length <= maxNumberOfColors) {
    returnPalette[sortable[sortable.length - 1][0]] = palette[palette.length - 1];
  }

  return returnPalette;
}
