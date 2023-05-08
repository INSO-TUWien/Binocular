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
                createdAt
                userFullName
                stats {
                  success
                  failed
                  pending
                  cancelled
                }
              }
            }
          }`,
          { page, perPage, since, until }
        )
        .then((resp) => resp.builds);
    };

    return traversePages(getBuildsPage(significantSpan[0], significantSpan[1]), (build) => {
      buildList.push(build);
    }).then(function () {
      return buildList;
    });
  }

  static getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    let next = moment(significantSpan[0]).startOf('day').toDate().getTime();
    const data = [
      {
        date: new Date(significantSpan[0]),
        stats: {
          success: 0,
          failed: 0,
          pending: 0,
          cancelled: 0,
        },
      },
    ];

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
            cancelled
          }
        }
      }
    }`,
          { page, perPage, since, until }
        )
        .then((resp) => resp.builds);
    };

    return traversePages(getBuildsPage(significantSpan[0], significantSpan[1]), (build) => {
      const createdAt = Date.parse(build.createdAt);

      while (createdAt >= next) {
        const dataPoint = {
          date: new Date(next),
          stats: _.defaults(
            {
              total: (build.stats.success || 0) + (build.stats.failed || 0) + (build.stats.pending || 0) + (build.stats.cancelled || 0),
            },
            build.stats
          ),
        };

        data.push(dataPoint);
        next += interval;
      }
    }).then(() => data);
  }
}
