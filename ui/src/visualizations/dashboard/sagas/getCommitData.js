'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get commit data from the database.
 * @param commitSpan Array of two time values (ms), first commit and last commit.
 * @param significantSpan Array of two time values (ms), first significant and last significant commit
 * (only these will actually be returned, used for zooming, the rest of the time will be empty data).
 * @param projects {[string]} containing the fullName of the base project
 * @returns {*}
 */
export default function getCommitData(commitSpan, significantSpan, projects) {

  let commitList = [];

  return traversePages(getCommitsPage(significantSpan[1], projects), (commit) => {
    commitList.push(commit);
  }).then(function() {
    return commitList;
  });
}

const getCommitsPage = (until, projects) => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int, $until: Timestamp, $projects: [String]) {
             commits(page: $page, perPage: $perPage, until: $until, projects: $projects) {
               count
               page
               perPage
               data {
                 sha
                 date
                 messageHeader
                 signature
                 stats {
                   additions
                   deletions
                 }
               }
             }
          }`,
      { page, perPage, until, projects }
    )
    .then(resp => resp.commits);
};
