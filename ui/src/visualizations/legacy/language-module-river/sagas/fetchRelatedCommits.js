'use strict';

import { createAction } from 'redux-actions';

import { collectPages, graphQl } from '../../../../utils';
import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils.ts';

export const requestRelatedCommits = createAction('SET_LANGUAGE_MODULE_RIVER_REQUEST_RELATED_COMMITS');
export const receiveRelatedCommits = timestampedActionFactory('SET_LANGUAGE_MODULE_RIVER_RECEIVE_RELATED_COMMITS');
export const receiveRelatedCommitsError = createAction('SET_LANGUAGE_MODULE_RIVER_RECEIVE_RELATED_COMMITS_ERROR');

export default fetchFactory(
  function* (issue) {
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

  return collectPages(getRelatedCommitsPage(issue)).map((commit) => commit);
}

const getRelatedCommitsPage = (issue) => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int, $iid: Int!){
         issue (iid: $iid){
           commits (page: $page, perPage: $perPage) {
             count
             data {
               sha
               webUrl
             }
           }
         }
       }`,
      { page, perPage, iid: issue.iid }
    )
    .then((resp) => resp.issue.commits);
};
