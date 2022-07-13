'use strict';

import { traversePages, graphQl } from '../../../../utils';

export default function getBuildData(commitSpan, significantSpan) {
  const buildList = [];

  return traversePages(getBuildsPage(significantSpan[0], significantSpan[1]), (build) => {
    buildList.push(build);
  }).then(function () {
    return buildList;
  });
}

const getBuildsPage = (since, until) => (page, perPage) => {
  return graphQl
    .query(
      `
    query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
      builds(page: $page, perPage: $perPage, since: $since, until: $until) {
        count
        page
        perPage
        count
        data {
          id
          createdAt
          stats {
            success
            failed
            pending
            canceled
          }
        }
      }
    }`,
      { page, perPage, since, until }
    )
    .then((resp) => resp.builds);
};
