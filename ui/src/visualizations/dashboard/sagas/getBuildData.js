'use strict';

import { traversePages, graphQl } from '../../../utils';
import buildList from '../../../../arango_export/builds.json';

export default function getBuildData() {
  return buildList;

  // return traversePages(getBuildsPage, build => {
  //   buildList.push(build);
  // }).then(function() {
  //   return buildList;
  // });
}

const getBuildsPage = (page, perPage) => {
  return graphQl
    .query(
      `
    query($page: Int, $perPage: Int) {
      builds(page: $page, perPage: $perPage) {
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
      { page, perPage }
    )
    .then(resp => resp.builds);
};
