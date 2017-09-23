'use strict';

import { createAction } from 'redux-actions';
import { reachGraphQL } from 'react-reach';
import { select } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from './utils.js';

export const setShowIssues = createAction('SET_SHOW_ISSUES', b => b);
export const setHighlightedIssue = createAction('SET_HIGHLIGHTED_ISSUE', i => i);
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE', i => i);

export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');

export const fetchCodeOwnershipData = fetchFactory(
  function*() {
    const { config } = yield select();

    return yield reachGraphQL(
      `${config.data.arango.webUrl}_db/pupil-${config.data.repoName}/pupil-ql`,
      `{
         commits {
           count
           data {
             sha,
             date,
             messageHeader,
             signature,
             stats {
               additions,
               deletions
             }
           }
         },
         issues {
           count
           data {
             iid,
             title,
             createdAt,
             closedAt,
             webUrl,
             mentions
           }
         }
      }`,
      {}
    ).catch(function(e) {
      console.warn(e);
      throw new Error('Error querying GraphQl');
    });
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);
