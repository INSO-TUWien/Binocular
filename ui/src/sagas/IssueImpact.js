'use strict';

import { createAction } from 'redux-actions';
import { reachGraphQL } from 'react-reach';
import { select, takeEvery } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from './utils.js';

export const setActiveIssue = createAction('SET_ACTIVE_ISSUE', i => i);
export const setFilteredCommits = createAction('SET_FILTERED_COMMITS', cs => cs);
export const setFilteredFiles = createAction('SET_FILTERED_FILES', fs => fs);

export const requestIssueImpactData = createAction('REQUEST_ISSUE_IMPACT_DATA');
export const receiveIssueImpactData = timestampedActionFactory('RECEIVE_ISSUE_IMPACT_DATA');
export const receiveIssueImpactDataError = createAction('RECEIVE_ISSUE_IMPACT_DATA_ERROR');

export function* watchSetActiveIssue() {
  yield takeEvery('SET_ACTIVE_ISSUE', fetchIssueImpactData);
}

export const fetchIssueImpactData = fetchFactory(
  function*() {
    const { config, issueImpactConfig: { activeIssueId } } = yield select();

    let issueQuery = '';

    if (activeIssueId !== null) {
      issueQuery = `
        issue(iid:${activeIssueId}) {
          iid
          title
          createdAt
          closedAt,
          webUrl
          commits {
            sha
            shortSha
            messageHeader
            date
            files {
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
        }`;
    }

    return yield reachGraphQL(
      `${config.data.arango.webUrl}_db/pupil-${config.data.repoName}/pupil-ql`,
      `{
         issues {
           iid,
           title
         }
         ${issueQuery}
       }`,
      {}
    )
      .then(resp => {
        if (activeIssueId === null) {
          resp.issue = null;
        }
        return resp;
      })
      .catch(function(e) {
        console.warn(e);
        throw new Error('Error querying GraphQl');
      });
  },
  requestIssueImpactData,
  receiveIssueImpactData,
  receiveIssueImpactDataError
);
