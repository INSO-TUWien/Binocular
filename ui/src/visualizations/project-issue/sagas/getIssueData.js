'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get issue data from the database.
 * @param issueSpan Array of two time values (ms), first commit and last issue.
 * @param significantSpan Array of two time values (ms), first significant and last significant issue
 * (only these will actually be returned, used for zooming, the rest of the time will be empty data).
 * @returns {*} (see below)
 */
export default function getIssueData(issueSpan, significantSpan) {
  const issueList = [];

  return traversePages(getIssuesPage(significantSpan[1]), issue => {
    issueList.push(issue);
  }).then(function() {
    return issueList;
  });
}

const getIssuesPage = until => (page, perPage) => {
  return graphQl
    .query(
      `
    query($page: Int, $perPage: Int, $until: Timestamp) {
      issues(page: $page, perPage: $perPage, until: $until) {
        count
        page
        perPage
        count
        data {
          title
          createdAt
          closedAt
        }
      }
    }`,
      { page, perPage, until }
    )
    .then(resp => resp.issues);
};
