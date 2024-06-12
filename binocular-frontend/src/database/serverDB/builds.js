'use strict';

import { graphQl, traversePages } from '../../utils';
import _ from 'lodash';
import moment from 'moment/moment';

export default class Builds {
  static getBuildData(commitSpan, significantSpan) {
    const buildList = [];

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
                status
                webUrl
                createdAt
                userFullName
                stats {
                  success
                  failed
                  pending
                  cancelled
                }
                commit {
                  sha
                  signature
                }
              }
            }
          }`,
          { page, perPage, since, until },
        )
        .then((resp) => resp.builds);
    };

    return traversePages(getBuildsPage(significantSpan[0], significantSpan[1]), (build) => {
      buildList.push(build);
    }).then(function () {
      return buildList;
    });
  }
}
