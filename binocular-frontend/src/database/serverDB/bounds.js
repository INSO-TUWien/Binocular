'use strict';

import { graphQl } from '../../utils';

export default class Bounds {
  static getBounds() {
    return graphQl
      .query(
        `{
         committers
         firstCommit: commits( perPage: 1, sort: "ASC" ) {
           data {
             date
             stats { additions deletions }
           }
         }
         lastCommit: commits( perPage: 1, sort: "DESC" ) {
           data {
             date
             stats { additions deletions }
           }
         },
         firstIssue: issues( perPage: 1, sort: "ASC" ) {
           data {
             createdAt
             closedAt
           }
         },
         lastIssue: issues( perPage: 1, sort: "DESC" ) {
           data {
             createdAt
             closedAt
           }
         },
         firstMergeRequest: mergeRequests( perPage: 1, sort: "ASC") {
           data {
             createdAt
             closedAt
           }
         },
         lastMergeRequest: mergeRequests( perPage: 1, sort: "DESC") {
           data {
            createdAt
            closedAt
           }
         },
         firstComment: comments( perPage: 1, sort: "ASC") {
          data {
            createdAt
          }
         },
         lastComment: comments( perPage: 1, sort: "DESC") {
          data {
            createdAt
          }
         }
       }`,
      )
      .then((resp) => ({
        firstCommit: resp.firstCommit.data[0],
        lastCommit: resp.lastCommit.data[0],
        firstIssue: resp.firstIssue.data[0],
        lastIssue: resp.lastIssue.data[0],
        committers: resp.committers,
        firstMergeRequest: resp.firstMergeRequest.data[0],
        lastMergeRequest: resp.lastMergeRequest.data[0],
        firstComment: resp.firstComment.data[0],
        lastComment: resp.lastComment.data[0],
      }));
  }
}
