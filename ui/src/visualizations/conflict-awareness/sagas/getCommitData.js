'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get commit data from the database.
 * @returns {*}
 */
export default function getCommitData() {
  let commitList = [];

  return traversePages(getCommitsPage, (commit) => {
    commitList.push(commit);
  }).then(function () {
    return commitList;
  });
}

/**
 * Gets a page containing commits incl. branches and parents.
 * @param page the page
 * @param perPage number of commits per page
 * @returns {*} the page containing the commits
 */
const getCommitsPage = (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int) {
             commits(page: $page, perPage: $perPage) {
               count
               page
               perPage
               data {
                 sha
                 date
                 messageHeader
                 signature
                 author
                 authorDate
                 stats {
                   additions
                   deletions
                 }
                 branches {
                  branchName
                 }
                 parents {
                  sha
                 }
               }
             }
          }`,
      { page, perPage }
    )
    .then((resp) => resp.commits);
};
