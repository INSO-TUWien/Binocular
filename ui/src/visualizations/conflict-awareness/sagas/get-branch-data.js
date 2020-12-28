'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get branch data from the database from the specific projects.
 * @param projects {[string]} the full names ("owner/repoName") of the projects
 * @returns {*} the branches including the branchName and the list of headShas (project, headSha)
 */
export default function getBranchData(projects) {
  let branchList = [];

  return traversePages(getBranchesPage(projects), (branch) => {
    branchList.push(branch);
  }).then(() => {
    return branchList;
  });
}

/**
 * Gets a page containing branches.
 * @param projects {[string]} the projects from which the branches should be retrieved
 * @returns {*} the page containing the branches
 */
const getBranchesPage = (projects) => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int) {
         branches(page: $page, perPage: $perPage) {
           count
           page
           perPage
           data {
             branchName
             headShas {
                project
                headSha
             }
           }
         }
      }`,
      { page, perPage, projects }
    )
    .then((resp) => resp.branches);
};
