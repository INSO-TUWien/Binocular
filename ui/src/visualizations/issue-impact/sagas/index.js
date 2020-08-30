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
export const openHunk = createAction('OPEN_HUNK');
export const openFile = createAction('OPEN_FILE');
export const openJob = createAction('OPEN_JOB');

export default function*() {
  yield fork(watchSetActiveIssue);
  yield fork(watchOpenCommit);
  yield fork(watchOpenHunk);
  yield fork(watchOpenJob);
  yield fork(watchOpenFile);
}

export function* watchSetActiveIssue() {
  yield takeEvery('SET_ACTIVE_ISSUE', fetchIssueImpactData);
}

export function* watchOpenCommit() {
  yield takeEvery('OPEN_COMMIT', openByWebUrl);
}

export function* watchOpenHunk() {
  yield takeEvery('OPEN_HUNK', openByWebUrl);
}

export function* watchOpenJob() {
  yield takeEvery('OPEN_JOB', openByWebUrl);
}

export function* watchOpenFile() {
  yield takeEvery('OPEN_FILE', openByWebUrl);
}

function openByWebUrl(action) {
  window.open(action.payload.webUrl);
}

export const fetchIssueImpactData = fetchFactory(
  function*() {
    const state = yield select();
    const activeIssueId = state.visualizations.issueImpact.state.config.activeIssueId;

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
                       webUrl
                     }
                     stats {
                      additions
                      deletions
                     }
                     file {
                       id
                       path
                       webUrl
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
                   webUrl
                   jobs {
                     id
                     name
                     stage
                     status
                     createdAt
                     finishedAt
                     webUrl
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
