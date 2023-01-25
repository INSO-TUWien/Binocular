'use strict';

import { traversePages, graphQl } from '../../../../utils';

export default function getBuildData() {
  const buildList = [];

  return traversePages(getBuildsPage, build => {
    buildList.push(build);
  }).then(function() {
    return buildList;
  });
}

const getBuildsPage = (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int) {
      baseBuilds(page: $page, perPage: $perPage) {
        page
        perPage
        data {
          sha
          jobs {
            status
          }
        }
      }
    }`,
      { page, perPage }
    )
    .then(resp => resp.baseBuilds);
};
