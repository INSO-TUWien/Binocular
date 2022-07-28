'use strict';

import { graphQl, traversePages } from '../utils';

export default class ServerDB {
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
       }`
      )
      .then((resp) => ({
        firstCommit: resp.firstCommit.data[0],
        lastCommit: resp.lastCommit.data[0],
        firstIssue: resp.firstIssue.data[0],
        lastIssue: resp.lastIssue.data[0],
        committers: resp.committers,
      }));
  }

  static getCommitData(commitSpan, significantSpan) {
    const commitList = [];

    const getCommitsPage = (since, until) => (page, perPage) => {
      return graphQl
        .query(
          `query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
             commits(page: $page, perPage: $perPage, since: $since, until: $until) {
               count
               page
               perPage
               data {
                 sha
                 date
                 messageHeader
                 signature
                 stats {
                   additions
                   deletions
                 }
               }
             }
          }`,
          { page, perPage, since, until }
        )
        .then((resp) => resp.commits);
    };

    return traversePages(getCommitsPage(significantSpan[0], significantSpan[1]), (commit) => {
      commitList.push(commit);
    }).then(function () {
      return commitList;
    });
  }
}
