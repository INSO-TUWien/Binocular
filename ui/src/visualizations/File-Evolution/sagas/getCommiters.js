'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * @returns {*} (see below)
 */
export default function getCommiters() {
  const committers = [];

  return traversePages(getCommittersPage(), stakeholders => {
    committers.push(stakeholders);
  }).then(function() {
    return committers;
  });
}

const getCommittersPage = until => (page, perPage) => {
  return graphQl
    .query(
      `query ($page: Int, $perPage: Int) {
         stakeholders(page: $page, perPage: $perPage) {
         data{
          gitSignature,
         }
      }
}`,
      { page, perPage, until }
    )
    .then(resp => resp.stakeholders);
};
