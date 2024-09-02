'use strict';

import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../../sagas/utils';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import { createAction } from 'redux-actions';
import chroma from 'chroma-js';
import _ from 'lodash';
import Database from '../../../../database/database';
import { GlobalState } from '../../../../types/globalTypes';
import { Commit } from '../../../../types/commitTypes';
import { Palette } from '../../../../types/authorTypes';
import { Bounds } from '../../../../types/boundsTypes';

export const setSelectedAuthors = createAction('SET_SELECTED_AUTHORS');
export const setDisplayMetric = createAction('SET_DISPLAY_METRIC');

export const requestChangesData = createAction('REQUEST_CHANGES_DATA');
export const receiveChangesData = timestampedActionFactory('RECEIVE_CHANGES_DATA');
export const receiveChangesDataError = createAction('RECEIVE_CHANGES_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

interface ChangesData {
  otherCount: number;
  filteredCommits: Commit[];
  commits: Commit[];
  committers: string[];
  palette: Palette;
  firstCommitTimestamp: number;
  lastCommitTimestamp: number;
  firstSignificantTimestamp: number;
  lastSignificantTimestamp: number;
}

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
  yield fork(watchExcludeMergeCommits);
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

function* watchExcludeMergeCommits() {
  yield takeEvery('SET_EXCLUDE_MERGE_COMMITS', fetchChangesData);
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
    const bounds: Bounds = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(bounds.firstCommit.date);
    const lastCommitTimestamp = Date.parse(bounds.lastCommit.date);

    const firstIssueTimestamp = bounds.firstIssue ? Date.parse(bounds.firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = bounds.lastIssue ? Date.parse(bounds.lastIssue.createdAt) : lastCommitTimestamp;

    const state: GlobalState = yield select();
    const viewport = state.visualizations.changes.state.config.viewport || [0, null];
    let firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);
    const timeSpan = state.universalSettings.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();
    const changesData: ChangesData = yield Promise.all([
      Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstCommitTimestamp, lastCommitTimestamp]),
    ])
      .then((result) => {
        // sort from oldest to newest commit
        const filteredCommits = result[0].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const commits = result[1].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const palette = getPalette(commits, 15, bounds.committers.length);

        return {
          otherCount: 0,
          filteredCommits,
          commits,
          committers: bounds.committers,
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
    return changesData;
  },
  requestChangesData,
  receiveChangesData,
  receiveChangesDataError,
);

function getPalette(commits: Commit[], maxNumberOfColors: number, numOfCommitters: number) {
  function chartColors(band: string, maxLength: number, length: number): string[] {
    const len = length > maxLength ? maxLength : length;
    return chroma.scale(band).mode('lch').colors(len);
  }

  const palette = chartColors('spectral', maxNumberOfColors, numOfCommitters);

  const totals: { [signature: string]: number } = {};
  _.each(commits, (commit) => {
    const changes = commit.stats.additions + commit.stats.deletions;
    if (totals[commit.signature]) {
      totals[commit.signature] += changes;
    } else {
      totals[commit.signature] = changes;
    }
  });

  const sortable: (string | number)[][] = [];
  _.each(Object.keys(totals), (key) => {
    sortable.push([key, totals[key]]);
  });

  sortable.sort((a: (string | number)[], b: (string | number)[]) => {
    return Number(b[1]) - Number(a[1]);
  });

  const returnPalette: Palette = {};

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
