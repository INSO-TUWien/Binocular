'use strict';

import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils';
import getBounds from './getBounds';
import Promise from 'bluebird';
import getBuildData from './getBuildData';
import { select } from 'redux-saga/effects';
import { createAction } from 'redux-actions';

export const requestBuildData = createAction('REQUEST_BUILD_DATA');
export const receiveBuildData = timestampedActionFactory('RECEIVE_BUILD_DATA');
export const receiveBuildDataError = createAction('RECEIVE_DASHBOARD_BUILD_ERROR');

export default function* () {
  // fetch data once on entry
  yield* fetchBuildsData();
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

    const firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    const lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);

    return yield Promise.join(getBuildData())
      .spread((builds) => {
        return {
          otherCount: 0,
          builds,
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
