'use strict';

import { graphQl, traversePages } from '../../utils';
import _ from 'lodash';
import moment from 'moment/moment';

export default class MergeRequests {
  static getMergeRequestData(mergeRequestSpan, significantSpan) {
    const mergeRequestList = [];
    const getMergeRequestsPage = (since, until) => (page, perPage) => {
      return graphQl
        .query(
          `
          query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
            mergeRequests(page: $page, perPage: $perPage, since: $since, until: $until) {
              count
              page
              perPage
              count
              data {
                id
                iid
                title
                state
                webUrl
                sourceBranch
                targetBranch
                timeStats{
                  time_estimate
                  total_time_spent
                }
                author{
                  login
                  name
                }
                assignees{
                  login
                  name 
                }
                assignee{
                  login
                  name 
                }
                createdAt
                notes{
                  body
                  createdAt
                  author{
                    login
                    name
                  }
                }
              }
            }
          }`,
          { page, perPage, since, until },
        )
        .then((resp) => resp.mergeRequests);
    };

    return traversePages(getMergeRequestsPage(significantSpan[0], significantSpan[1]), (mergeRequest) => {
      mergeRequestList.push(mergeRequest);
    }).then(function () {
      return mergeRequestList;
    });
  }
}
