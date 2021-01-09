'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get the iid and title of all issues from the database.
 * @returns {*} all issues (iid and title)
 */
export default function getIssueData() {
  let issueList = [];

  return traversePages(getIssuesPage, (issue) => {
    issueList.push(issue);
  }).then(() => {
    return issueList;
  });
}

/**
 * Gets a page containing issues.
 * @param page the page
 * @param perPage the number of issues per page
 * @returns {*} the page containing the issues
 */
const getIssuesPage = (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int) {
         issues(page: $page, perPage: $perPage) {
           count
           page
           perPage
           data {
             iid
             title
           }
         }
      }`,
      { page, perPage }
    )
    .then((resp) => resp.issues);
};
