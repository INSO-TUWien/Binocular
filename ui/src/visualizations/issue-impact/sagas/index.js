'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';
import { graphQl } from '../../../utils';

export const setActiveIssue = createAction('SET_ACTIVE_ISSUE', i => i);
export const setFilteredCommits = createAction('SET_FILTERED_COMMITS', cs => cs);
export const setFilteredFiles = createAction('SET_FILTERED_FILES', fs => fs);

export const requestIssueImpactData = createAction('REQUEST_ISSUE_IMPACT_DATA');
export const receiveIssueImpactData = timestampedActionFactory('RECEIVE_ISSUE_IMPACT_DATA');
export const receiveIssueImpactDataError = createAction('RECEIVE_ISSUE_IMPACT_DATA_ERROR');

export const openCommit = createAction('OPEN_COMMIT');

export default function*() {
  yield fork(watchSetActiveIssue);
  yield fork(watchOpenCommit);
}

export function* watchSetActiveIssue() {
  yield takeEvery('SET_ACTIVE_ISSUE', fetchIssueImpactData);
}

export function* watchOpenCommit() {
  yield takeEvery('OPEN_COMMIT', function(action) {
    const commit = action.payload;
    window.open(commit.webUrl);
  });
}

export const fetchIssueImpactData = fetchFactory(
  function*() {
    const { issueImpactConfig: { activeIssueId } } = yield select();

    if (activeIssueId === null) {
      return { issue: null };
    }

    return yield graphQl
      .query(
        `query($iid: Int!) {
           issue(iid: $iid) {
             iid
             title
             createdAt
             closedAt,
             webUrl
             commits {
               data {
                 sha
                 shortSha
                 messageHeader
                 date
                 webUrl
                 files {
                   data {
                     lineCount
                     hunks {
                       newStart
                       newLines
                       oldStart
                       oldLines
                     }
                     file {
                       id
                       path
                       maxLength
                     }
                   }
                 }
                 builds {
                   id
                   createdAt
                   finishedAt
                   duration
                   status
                   jobs {
                     id
                     name
                     stage
                     status
                     createdAt
                     finishedAt
                   }
                 }
               }
             }
           }
         }`,
        { iid: activeIssueId }
      )
      .then(resp => {
        return resp;
      });
  },
  requestIssueImpactData,
  receiveIssueImpactData,
  receiveIssueImpactDataError
);
