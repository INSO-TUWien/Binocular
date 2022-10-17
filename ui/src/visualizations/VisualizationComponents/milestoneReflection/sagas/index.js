'use strict';

// import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';
import { createAction } from 'redux-actions';
import { fetchFactory } from '../../../../sagas/utils';
import getBounds from '../../issues/sagas/getBounds';
import Promise from 'bluebird';
import getIssueData from '../../issues/sagas/getIssueData';
import { receiveIssueData, receiveIssueDataError, requestIssueData } from '../../issues/sagas';

// import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';
// import { graphQl } from '../../../utils';

export const setMilestone = createAction('MS_SET_MILESTONE');
export const setIssueInfo = createAction('MS_SET_ISSUE_INFORMATION');

export default function* () {
  // fetch data once on entry
  yield* fetchIssuesData();

  yield fork(watchOptionMilestoneChanged);
  yield fork(watchOptionIssueInfoChanged);
}

export function* watchOptionMilestoneChanged() {
  console.log('watchOpenCommit');
  yield takeEvery('MS_SET_MILESTONE', () => {});
}

export function* watchOptionIssueInfoChanged() {
  yield takeEvery('MS_SET_ISSUE_INFORMATION', (issueInfo) => {
    console.log('issue Info: ' + issueInfo.payload);
    // console.log(issueInfo);

  });
}

/*export function* watchOpenCommit() {
  console.log('watchOpenCommit');

  // yield takeEvery('OPEN_COMMIT', openByWebUrl);
}*/

// github file as json endpoint if needed
// https://raw.githubusercontent.com/INSO-TUWien/Binocular/main/package.json

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

    let firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);
    const timeSpan = state.visualizations.newDashboard.state.config.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();

    return yield Promise.join(
      getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstIssueTimestamp, lastIssueTimestamp])
    )
      .spread((filteredIssues, issues) => {
        return {
          otherCount: 0,
          filteredIssues,
          issues,
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
  requestIssueData,
  receiveIssueData,
  receiveIssueDataError
);
