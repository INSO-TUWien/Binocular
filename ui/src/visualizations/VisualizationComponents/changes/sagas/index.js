'use strict';

import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../../sagas/utils';
import Promise from 'bluebird';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import { createAction } from 'redux-actions';
import chroma from 'chroma-js';
import _ from 'lodash';
import Database from '../../../../database/database';

export const setSelectedAuthors = createAction('SET_SELECTED_AUTHORS');
export const setDisplayMetric = createAction('SET_DISPLAY_METRIC');

export const requestChangesData = createAction('REQUEST_CHANGES_DATA');
export const receiveChangesData = timestampedActionFactory('RECEIVE_CHANGES_DATA');
export const receiveChangesDataError = createAction('RECEIVE_CHANGES_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function* () {
  // fetch data once on entry
  yield* fetchChangesData();

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
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchChangesData);
}

function* watchSelectedAuthorsGlobal() {
  yield takeEvery('SET_SELECTED_AUTHORS_GLOBAL', fetchChangesData);
}

function* watchOtherAuthors() {
  yield takeEvery('SET_OTHER_AUTHORS', fetchChangesData);
}

function* watchMergedAuthors() {
  yield takeEvery('SET_MERGED_AUTHORS', fetchChangesData);
}

function* watchRefreshRequests() {
  yield throttle(5000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchChangesData);
}

/**
 * Fetch data for dashboard, this still includes old functions that were copied over.
 */
export const fetchChangesData = fetchFactory(
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
    const timeSpan = state.visualizations.newDashboard.state.config.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();
    return yield Promise.join(
      Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstCommitTimestamp, lastCommitTimestamp])
    )
      .spread((filteredCommits, commits) => {
        const palette = getPalette(commits, 15, committers.length);

        return {
          otherCount: 0,
          filteredCommits,
          commits,
          committers,
          palette,
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
  requestChangesData,
  receiveChangesData,
  receiveChangesDataError
);

function getPalette(commits, maxNumberOfColors, numOfCommitters) {
  function chartColors(band, maxLength, length) {
    const len = length > maxLength ? maxLength : length;
    return chroma.scale(band).mode('lch').colors(len);
  }

  const palette = chartColors('spectral', maxNumberOfColors, numOfCommitters);

  const totals = {};
  _.each(commits, (commit) => {
    const changes = commit.stats.additions + commit.stats.deletions;
    if (totals[commit.signature]) {
      totals[commit.signature] += changes;
    } else {
      totals[commit.signature] = changes;
    }
  });

  const sortable = [];
  _.each(Object.keys(totals), (key) => {
    sortable.push([key, totals[key]]);
  });

  sortable.sort((a, b) => {
    return b[1] - a[1];
  });

  const returnPalette = {};

  for (let i = 0; i < Math.min(sortable.length, palette.length) - 1; i++) {
    returnPalette[sortable[i][0]] = palette[i];
  }
  if (sortable.length > maxNumberOfColors) {
    returnPalette['others'] = palette[maxNumberOfColors - 1];
  } else {
    returnPalette[sortable[sortable.length - 1][0]] = palette[palette.length - 1];
  }

  return returnPalette;
}
