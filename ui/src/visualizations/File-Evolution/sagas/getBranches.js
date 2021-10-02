'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get branches from the database.
 * @returns {*}
 */
export default function getBranches() {
  const branchList = [];

  return traversePages(getBranchPage(), branch => {
    branchList.push(branch);
  }).then(function() {
    return branchList;
  });
}

const getBranchPage = until => (page, perPage) => {
  return graphQl
    .query(
      `query ($page: Int, $perPage: Int) {
                branches(page: $page, perPage: $perPage, sort: "ASC") {
                  count
                  data{
                    id
                    branch
                    active
                  }
                }
              }`,
      { page, perPage }
    )
    .then(resp => resp.branches);
};
