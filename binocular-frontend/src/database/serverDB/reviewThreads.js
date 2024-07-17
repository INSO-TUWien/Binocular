'use strict';

import { graphQl, traversePages } from '../../utils';
import _ from 'lodash';

export default class ReviewThreads {
  static getReviewThreadData() {
    console.log('TEST');

    const reviewThreadList = [];
    const getReviewThreadsPage = () => (page, perPage) => {
      return graphQl
        .query(
          `
          query($page: Int, $perPage: Int) {
            reviewThreads(page: $page, perPage: $perPage) {
              count
              page
              perPage
              count
              data {
                id
                isResolved
                path
                resolvedBy {
                    login
                }
                comments {
                  id
                }
              }
            }
          }`,
          { page, perPage },
        )
        .then((resp) => resp.reviewThreads);
    };

    return traversePages(getReviewThreadsPage(), (reviewThread) => {
      reviewThreadList.push(reviewThread);
    }).then(function () {
      return reviewThreadList;
    });
  }
}
