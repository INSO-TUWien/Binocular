'use strict';

import visualizationRegistry from '../visualizationRegistry';
import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import chroma from 'chroma-js';
import _ from 'lodash';
import Promise from 'bluebird';
import Database from '../../../database/database.js';
import { getChartColors } from '../../../utils';

export const setResolution = createAction('SET_RESOLUTION');
export const setTimeSpan = createAction('SET_TIME_SPAN');
export const setSelectedAuthors = createAction('SET_SELECTED_AUTHORS_GLOBAL');
export const setAllAuthors = createAction('SET_All_AUTHORS');
export const setMergedAuthorList = createAction('SET_MERGED_AUTHOR_LIST');
export const setOtherAuthorList = createAction('SET_OTHER_AUTHOR_LIST');
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
        const palette = getChartColors('spectral', [...committers, 'other']);
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
