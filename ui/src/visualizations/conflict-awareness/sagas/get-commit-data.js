'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get commit data from the database from the specific projects.
 * @param projects {[string]} the full names ("owner/repoName") of the projects
 * @returns {*} the commits incl. branches, children, projects and its metadata
 */
export default function getCommitData(projects) {
  let commitList = [];

  return traversePages(getCommitsPage(projects), (commit) => {
    commitList.push(commit);
  }).then(function () {
    return commitList;
  });
}

/**
 * Gets a page containing commits incl. branches and children.
 * @param projects {[string]} the projects from which the commits should be retrieved
 * @returns {*} the page containing the commits
 */
const getCommitsPage = (projects) => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int, $projects: [String]) {
             commits(page: $page, perPage: $perPage, projects: $projects) {
               count
               page
               perPage
               data {
                 sha
                 date
                 messageHeader
                 message
                 signature
                 author
                 authorDate
                 branches {
                  branchName
                 }
                 children {
                  sha
                 }
                 projects
               }
             }
          }`,
      { page, perPage, projects }
    )
    .then((resp) => resp.commits);
};
