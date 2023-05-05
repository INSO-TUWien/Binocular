'use strict';

import { graphQl, traversePages } from '../../utils';
import _ from 'lodash';
import moment from 'moment/moment';

export default class Issues {
  static getIssueData(issueSpan, significantSpan) {
    const issueList = [];

    const getIssuesPage = (since, until) => (page, perPage) => {
      return graphQl
        .query(
          `
          query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
            issues(page: $page, perPage: $perPage, since: $since, until: $until) {
              count
              page
              perPage
              count
              data {
                iid
                title
                createdAt
                closedAt
                webUrl
                author{
                  login
                  name
                }
              }
            }
          }`,
          { page, perPage, since, until }
        )
        .then((resp) => resp.issues);
    };

    return traversePages(getIssuesPage(significantSpan[0], significantSpan[1]), (issue) => {
      issueList.push(issue);
    }).then(function () {
      return issueList;
    });
  }

  static getCommitsForIssue(iid) {
    return graphQl
        .query(
          `query{
             issue (iid: ${iid}){
              
              commits {
                count
                data {
                  sha
                }
              }
             }
           }`,
          { iid }
        )
        .then((resp) => resp.issue.commits.data.map(c => c.sha));
  }

  static getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval) {
    // holds close dates of still open issues, kept sorted at all times
    const pendingCloses = [];

    // issues closed so far
    let closeCountTotal = 0,
      count = 0;

    let next = moment(significantSpan[0]).startOf('day').toDate().getTime();
    const data = [
      {
        date: new Date(issueSpan[0]),
        count: 0,
        openCount: 0,
        closedCount: 0,
      },
    ];

    const getIssuesPage = (since, until) => (page, perPage) => {
      return graphQl
        .query(
          `
    query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
      issues(page: $page, perPage: $perPage, since: $since, until: $until) {
        count
        page
        perPage
        count
        data {
          title
          createdAt
          closedAt
        }
      }
    }`,
          { page, perPage, since, until }
        )
        .then((resp) => resp.issues);
    };

    return traversePages(getIssuesPage(significantSpan[0], significantSpan[1]), (issue) => {
      const createdAt = Date.parse(issue.createdAt);
      const closedAt = issue.closedAt ? Date.parse(issue.closedAt) : null;

      count++;

      // the number of closed issues at the issue's creation time, since
      // the last time we increased closedCountTotal
      const closedCount = _.sortedIndex(pendingCloses, createdAt);
      closeCountTotal += closedCount;

      // remove all issues that are closed by now from the "pending" list
      pendingCloses.splice(0, closedCount);

      while (createdAt >= next) {
        const dataPoint = {
          date: new Date(next),
          count,
          closedCount: closeCountTotal,
          openCount: count - closeCountTotal,
        };

        data.push(dataPoint);
        next += interval;
      }

      if (closedAt) {
        // issue has a close date, be sure to track it in the "pending" list
        const insertPos = _.sortedIndex(pendingCloses, closedAt);
        pendingCloses.splice(insertPos, 0, closedAt);
      } else {
        // the issue has not yet been closed, indicate that by pushing
        // null to the end of the pendingCloses list, which will always
        // stay there
        pendingCloses.push(null);
      }
    }).then(() => data);
  }

  static issueImpactQuery(iid, since, until) {
    return graphQl.query(
      `query($iid: Int!, $since: Timestamp, $until: Timestamp) {
           issue(iid: $iid) {
             iid
             title
             createdAt
             closedAt,
             webUrl
             commits (since: $since, until: $until) {
               data {
                 sha
                 shortSha
                 messageHeader
                 date
                 webUrl
                 files {
                   data {
                     lineCount
                     hunks {
                       newStart
                       newLines
                       oldStart
                       oldLines
                       webUrl
                     }
                     stats {
                      additions
                      deletions
                     }
                     file {
                       id
                       path
                       webUrl
                       maxLength
                     }
                   }
                 }
                 builds {
                   id
                   createdAt
                   finishedAt
                   duration
                   status
                   webUrl
                   jobs {
                     id
                     name
                     stage
                     status
                     createdAt
                     finishedAt
                     webUrl
                   }
                 }
               }
             }
           }
         }`,
      { iid: iid, since: since, until: until }
    );
  }

  static searchIssues(text) {
    const issueList = [];

    const getIssuesPageSearch = (text) => (page, perPage) => {
      return graphQl
        .query(
          `
                  query($q: String) {
                    issues(page: 1, perPage: 50, q: $q, sort: "DESC") {
                      data { iid title createdAt closedAt }
                    }
                  }`,
          { q: text }
        )
        .then((resp) => resp.issues);
    };

    return traversePages(getIssuesPageSearch(text), (issue) => {
      issueList.push(issue);
    }).then(function () {
      return issueList;
    });
  }

  static getCodeHotspotsIssueData(file) {
    return graphQl.query(
      `
        query($file: String!) {
          issues{
            data{
              title
              description
              iid
              commits{
                data{
                  message
                  sha
                  signature
                  branch
                  date
                  parents
                  stats{
                    additions
                    deletions
                  }
                  file(path: $file){
                    file{
                      path
                    }
                    lineCount
                    hunks{
                      newStart
                      newLines
                      oldStart
                      oldLines
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { file: file }
    );
  }
}
