'use strict';

// import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';
import { createAction } from 'redux-actions';
import { fetchFactory } from '../../../../sagas/utils';
import getBounds from '../../issues/sagas/getBounds';
import Promise from 'bluebird';
import getIssueData from '../../issues/sagas/getIssueData';

// import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';
// import { graphQl } from '../../../utils';

export const setMilestone = createAction('MS_SET_MILESTONE');
export const setIssueInfo = createAction('MS_SET_ISSUE_INFORMATION');
export const requestIssueData = createAction('MS_REQUEST_ISSUE_DATA');
export const receiveIssueData = createAction('MS_RECEIVE_ISSUE_DATA');
export const receiveIssueDataError = createAction('MS_RECEIVE_ISSUE_DATA_ERROR');

export default function* () {
  // fetch data once on entry
  yield* fetchIssuesData();

  yield fork(watchOptionMilestoneChanged);
  yield fork(watchOptionIssueInfoChanged);

  yield fork(watchOptionIssueAreRequested);
  yield fork(watchOptionIssueAreReceived);
}

export function* watchOptionMilestoneChanged() {
  yield takeEvery('MS_SET_MILESTONE', () => {});
}

export function* watchOptionIssueInfoChanged() {
  yield takeEvery('MS_SET_ISSUE_INFORMATION', (issueInfo) => {
    console.log('issue Info: ' + issueInfo.payload);
    // console.log(issueInfo);
  });
}

export function* watchOptionIssueAreRequested() {
  yield takeEvery('MS_REQUEST_ISSUE_DATA', (issueInfo) => {
    console.log('MS_REQUEST_ISSUE_DATA: ' + issueInfo.payload);
    // console.log(issueInfo);
  });
}
export function* watchOptionIssueAreReceived() {
  yield takeEvery('MS_RECEIVE_ISSUE_DATA', (issueInfo) => {
    console.log('MS_RECEIVE_ISSUE_DATA:' + issueInfo.payload);
    // console.log(issueInfo);
  });
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

    const data = yield getIssueData([firstIssueTimestamp, lastIssueTimestamp], [firstIssueTimestamp, lastIssueTimestamp]);

    return data;
  },
  requestIssueData,
  receiveIssueData,
  receiveIssueDataError
);
