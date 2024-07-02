'use strict';

import { graphQl, traversePages } from '../../utils';
import _ from 'lodash';

export default class Comments {
  static getCommentData(commentSpan, significantSpan) {
    const commentList = [];
    const getCommentsPage = (since, until) => (page, perPage) => {
      return graphQl
        .query(
          `
          query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
            comments(page: $page, perPage: $perPage, since: $since, until: $until) {
              count
              page
              perPage
              count
              data {
                id
                author{
                  login
                  name
                }
                createdAt
                updatedAt
                lastEditedAt
                path
                bodyText
                comments {
                  id
                  author {
                    login
                    name
                  }
                  createdAt
                  updatedAt
                  lastEditedAt
                  path
                  bodyText
                }
              }
            }
          }`,
          { page, perPage, since, until },
        )
        .then((resp) => resp.comments);
    };

    return traversePages(getCommentsPage(significantSpan[0], significantSpan[1]), (comment) => {
      commentList.push(comment);
    }).then(function () {
      return commentList;
    });
  }
}
