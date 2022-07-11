'use strict';

import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils';
import getBounds from './getBounds';
import Promise from 'bluebird';
import getIssueData from './getIssueData';
import { select } from 'redux-saga/effects';
import { createAction } from 'redux-actions';

export const setShowIssues = createAction('SET_SHOW_ISSUES');

export const requestIssueData = createAction('REQUEST_ISSUE_DATA');
export const receiveIssueData = timestampedActionFactory('RECEIVE_ISSUE_DATA');
export const receiveIssueDataError = createAction('RECEIVE_DASHBOARD_ISSUE_ERROR');

export default function* () {
  // fetch data once on entry
  yield* fetchIssuesData();
}

/**
 * Fetch data for dashboard, this still includes old functions that were copied over.
 */
export const fetchIssuesData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, firstIssue, lastIssue } = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const viewport = state.visualizations.issues.state.config.viewport || [0, null];

    const firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    const lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);

    return yield Promise.join(
      getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp])
    )
      .spread((issues) => {
        return {
          otherCount: 0,
          issues,
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
