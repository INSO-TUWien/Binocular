'use strict';

import { traversePages, graphQl } from '../../../../utils';

export default function getIssueData(issueSpan, significantSpan) {
  const issueList = [];

  return traversePages(getIssuesPage(significantSpan[0], significantSpan[1]), (issue) => {
    issueList.push(issue);
  }).then(function () {
    return issueList;
  });
}

const getIssuesPage = (since, until) => (page, perPage) => {
  return graphQl
    .query(
      `
    query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
      issues(page: $page, perPage: $perPage, since: $since, until: $until) {
        count
        page
        perPage
        count
        data {
          id
          iid
          title
          createdAt
          closedAt
          author{
            login
            name
          }
        }
      }
    }`,
      { page, perPage, since, until }
    )
    .then((resp) => resp.issues);
};
