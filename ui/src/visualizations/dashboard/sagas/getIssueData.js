'use strict';

import { traversePages, graphQl } from '../../../utils';

export default function getIssueData(issueSpan, significantSpan) {
  let issueList = [];

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
