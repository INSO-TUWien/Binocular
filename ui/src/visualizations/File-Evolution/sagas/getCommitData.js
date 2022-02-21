'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get commit data from the database.
 * @returns {*}
 */
export default function getCommitData() {
  const commitList = [];

  return traversePages(getCommitsPage(), commit => {
    commitList.push(commit);
  }).then(function() {
    return commitList;
  });
}

const getCommitsPage = until => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int) {
             commits(page: $page, perPage: $perPage, sort: "ASC" ) {
               count
               data {
                 sha
                 date
                 branch
                 shortSha
                 message
                 messageHeader
                 signature
                 webUrl
                 stats {
                   additions
                   deletions
                 }
               }
             }
          }`,
      { page, perPage, until }
    )
    .then(resp => resp.commits);
};
