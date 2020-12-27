'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get branch data from the database.
 * @returns {*}
 */
export default function getBranchData() {
  let branchList = [];

  return traversePages(getBranchesPage, (branch) => {
    branchList.push(branch);
  }).then(() => {
    return branchList;
  });
}

/**
 * Gets a page containing branches.
 * @param page the page
 * @param perPage number of commits per page
 * @returns {*} the page containing the branches
 */
const getBranchesPage = (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int) {
             branches(page: $page, perPage: $perPage) {
               count
               page
               perPage
               data {
                 branchName
                 headSha
               }
             }
          }`,
      { page, perPage }
    )
    .then((resp) => resp.branches);
};
