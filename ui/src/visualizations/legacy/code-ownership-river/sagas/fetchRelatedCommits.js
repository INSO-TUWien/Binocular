'use strict';

import { createAction } from 'redux-actions';

import { collectPages, graphQl } from '../../../../utils';
import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils.js';

export const requestRelatedCommits = createAction('COR_REQUEST_RELATED_COMMITS');
export const receiveRelatedCommits = timestampedActionFactory('COR_RECEIVE_RELATED_COMMITS');
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
  if (!issue) {
    return [];
  }

  return collectPages(getRelatedCommitsPage(issue)).map(commit => {
    commit.date = new Date(commit.date);
    return commit;
  });
}

const getRelatedCommitsPage = issue => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int, $iid: Int!){
         issue (iid: $iid){
           commits (page: $page, perPage: $perPage) {
             count
             data {
               sha
               shortSha
               message
               messageHeader
               signature
               webUrl
               date
             }
           }
         }
       }`,
      { page, perPage, iid: issue.iid }
    )
    .then(resp => resp.issue.commits);
};
