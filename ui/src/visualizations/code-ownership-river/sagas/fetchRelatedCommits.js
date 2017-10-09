'use strict';

import { createAction } from 'redux-actions';

import { traversePages, graphQl } from '../../../utils.js';
import { fetchFactory } from '../../../sagas/utils.js';

export const requestRelatedCommits = createAction('COR_REQUEST_RELATED_COMMITS');
export const receiveRelatedCommits = createAction('COR_RECEIVE_RELATED_COMMITS');
export const receiveRelatedCommitsError = createAction('COR_RECEIVE_RELATED_COMMITS_ERROR');

export default fetchFactory(
  function*(issue) {
    return yield getRelatedCommitData(issue);
  },
  requestRelatedCommits,
  receiveRelatedCommits,
  receiveRelatedCommitsError
);

function getRelatedCommitData(issue) {
  return traversePages(
    getRelatedCommitsPage(issue),
    commit => {
      console.log('processing commit', commit);
    },
    () => null
  );
}

const getRelatedCommitsPage = issue => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int, $iid: Int!){
         issue (iid: $iid){
           iid
           title
           commits (page: $page, perPage: $perPage) {
             count
             data {
               sha
               shortSha
               message
               messageHeader
               signature
               date
             }
           }
         }
       }`,
      { page, perPage, iid: issue.iid }
    )
    .then(resp => resp.issue.commits);
};
