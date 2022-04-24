'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get issue commit data from the database.
 * @param commitSpan Array of two time values (ms), first commit and last commit.
 * @param significantSpan Array of two time values (ms), first significant and last significant commit
 * (only these will actually be returned, used for zooming, the rest of the time will be empty data).
 * @returns {*} (see below)
 */
export default function getIssueCommitData(issueCommitSpan, significantSpan) {
  const issueCommitList = [];

  return traversePages(getIssueCommitsPage(significantSpan[1]), issueCommit => {
    issueCommitList.push(issueCommit);
  }).then(function() {
    return issueCommitList;
  });
}

const getIssueCommitsPage = until => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int, $until: Timestamp) {
          issues(page: $page, perPage: $perPage, until: $until) {
            count
            page
            perPage
            count
            data {
              title
              description
              createdAt
              closedAt
              state
            }
          }
        }`,
      { page, perPage, until }
    )
    .then(resp => resp.issues);
};
