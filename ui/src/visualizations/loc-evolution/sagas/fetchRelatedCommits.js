'use strict';

import { createAction } from 'redux-actions';

import { collectPages, graphQl } from '../../../utils';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';

export const requestRelatedCommits = createAction('COR_REQUEST_RELATED_COMMITS');
export const receiveRelatedCommits = timestampedActionFactory('COR_RECEIVE_RELATED_COMMITS');
export const receiveRelatedCommitsError = createAction('COR_RECEIVE_RELATED_COMMITS_ERROR');

export default fetchFactory(
  function*(issue) {
    return yield getRelatedCommitData(issue);
  },
  function*(filename, perPage){
    return yield getRelatedCommits(filename, perPage);
  },
  requestRelatedCommits,
  receiveRelatedCommits,
  receiveRelatedCommitsError,
  getRelatedCommits
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


function getRelatedCommits(filename, perPage){
  return graphQl
    .query(
      `query commitsForSpecificFile($filename: String!, $perPage: Int) {
        file(path: $filename) {
          id
          path
          commits(page: 1, perPage: $perPage) {
            data {
              date
              files {
                data {
                  file {
                    path
                  }
                  stats {
                    additions
                    deletions
                  }
                }
              }
            }
          }
        }
      }`,
      { filename, perPage }
    )
    .then(resp => {return resp});
};