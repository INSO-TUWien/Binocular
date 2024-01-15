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
         }
       }`,
      )
      .then((resp) => ({
        firstCommit: resp.firstCommit.data[0],
        lastCommit: resp.lastCommit.data[0],
        firstIssue: resp.firstIssue.data[0],
        lastIssue: resp.lastIssue.data[0],
        committers: resp.committers,
      }));
  }
}
