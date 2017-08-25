'use strict';

import { createAction } from 'redux-actions';
import { reachGraphQL } from 'react-reach';
import { select } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from './utils.js';

export const setShowIssues = createAction('SET_SHOW_ISSUES', b => b);
export const setIssue = createAction('SET_HIGHLIGHTED_ISSUE', i => i);

export const requestIssueImpactData = createAction('REQUEST_ISSUE_IMPACT_DATA');
export const receiveIssueImpactData = timestampedActionFactory('RECEIVE_ISSUE_IMPACT_DATA');
export const receiveIssueImpactDataError = createAction('RECEIVE_ISSUE_IMPACT_DATA_ERROR');

export const fetchIssueImpactData = fetchFactory(
  function*() {
    const { config, issueImpactConfig: { activeIssueId } } = yield select();

    return yield reachGraphQL(
      `${config.data.arango.webUrl}_db/pupil-${config.data.repoName}/pupil-ql`,
      `{
         issues {
           iid,
           title
         },
         issue(iid:${activeIssueId}) {
           iid,
           commits {
             sha,
             files {
               lineCount,
               hunks {
                 newStart,
                 newLines,
                 oldStart,
                 oldLines,
               },
               file {
                 id,
                 path
               }
             }
           }
         }
       }`,
      {}
    ).catch(function(e) {
      console.warn(e);
      throw new Error('Error querying GraphQl');
    });
  },
  requestIssueImpactData,
  receiveIssueImpactData,
  receiveIssueImpactDataError
);
