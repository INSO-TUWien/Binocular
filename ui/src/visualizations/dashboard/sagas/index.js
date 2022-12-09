'use strict';

import visualizationRegistry from '../visualizationRegistry';
import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import chroma from 'chroma-js';
import _ from 'lodash';
import Promise from 'bluebird';
import Database from '../../../database/database.js';

export const setResolution = createAction('SET_RESOLUTION');
export const setTimeSpan = createAction('SET_TIME_SPAN');
export const setSelectedAuthors = createAction('SET_SELECTED_AUTHORS_GLOBAL');
export const setAllAuthors = createAction('SET_All_AUTHORS');

export const requestDashboardData = createAction('REQUEST_DASHBOARD_DATA');
export const receiveDashboardData = timestampedActionFactory('RECEIVE_DASHBOARD_DATA');
export const receiveDashboardDataError = createAction('RECEIVE_DASHBOARD_DATA_ERROR');

export default function* () {
  for (const visualization in visualizationRegistry) {
    const viz = visualizationRegistry[visualization];
    if (viz.saga !== undefined) {
      yield* viz.saga();
    }
  }
  yield* fetchDashboardData();
}

export const fetchDashboardData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const firstSignificantTimestamp = Math.min(firstCommitTimestamp, firstIssueTimestamp);
    const lastSignificantTimestamp = Math.max(lastCommitTimestamp, lastIssueTimestamp);

    return yield Promise.join(
      Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp])
    )
      .spread((commits) => {
        const palette = getPalette(commits, 15, committers.length);
        return {
          firstCommit,
          lastCommit,
          firstIssue,
          lastIssue,
          committers,
          palette,
          firstSignificantTimestamp,
          lastSignificantTimestamp,
        };
      })
      .catch(function (e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestDashboardData,
  receiveDashboardData,
  receiveDashboardDataError
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
