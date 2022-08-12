'use strict';

import { collectPages, graphQl, traversePages } from '../utils';
import _ from 'lodash';
import moment from 'moment/moment';

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
                  canceled
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
                title
                createdAt
                closedAt
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

  static getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    const statsByAuthor = {};

    const totals = {
      count: 0,
      additions: 0,
      deletions: 0,
      changes: 0,
    };

    const data = [
      {
        date: new Date(significantSpan[0]),
        totals: _.cloneDeep(totals),
        statsByAuthor: {},
      },
    ];

    let next = moment(significantSpan[0]).startOf(granularity.unit).toDate().getTime();

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
    function group(data) {
      const lastDatum = _.last(data);

      if (_.keys(lastDatum.statsByAuthor).length < 50) {
        return data;
      }

      const meanCommitCount = _.meanBy(_.values(lastDatum.statsByAuthor), 'count');
      const threshhold = meanCommitCount;

      const applyGroupBy = (stats, predicate) => {
        const groupStats = {
          count: 0,
          additions: 0,
          deletions: 0,
          changes: 0,
        };
        const groupedCommitters = [];

        const groupedStats = _.omitBy(stats, (stats, author) => {
          if (predicate(stats, author)) {
            groupStats.count += stats.count;
            groupStats.additions += stats.additions;
            groupStats.deletions += stats.deletions;
            groupStats.changes += stats.changes;
            groupedCommitters.push(author);
            return true;
          }
        });

        groupedStats.other = groupStats;

        return {
          groupedStats,
          groupedCommitters,
        };
      };

      const { groupedCommitters } = applyGroupBy(lastDatum.statsByAuthor, (stats) => {
        return stats.count <= threshhold;
      });

      _.each(data, (datum) => {
        const { groupedStats } = applyGroupBy(datum.statsByAuthor, (stats, author) => _.includes(groupedCommitters, author));

        datum.statsByAuthor = groupedStats;
      });

      return data;
    }
    return traversePages(getCommitsPage(significantSpan[0], significantSpan[1]), (commit) => {
      const dt = Date.parse(commit.date);
      let stats = statsByAuthor[commit.signature];
      if (!stats) {
        stats = statsByAuthor[commit.signature] = {
          count: 0,
          additions: 0,
          deletions: 0,
          changes: 0,
        };
      }

      totals.count++;
      totals.additions += commit.stats.additions;
      totals.deletions += commit.stats.deletions;
      totals.changes += commit.stats.additions + commit.stats.deletions;

      stats.count++;
      stats.additions += commit.stats.additions;
      stats.deletions += commit.stats.deletions;
      stats.changes += commit.stats.additions + commit.stats.deletions;

      while (dt >= next) {
        const dataPoint = {
          date: new Date(next),
          totals: _.cloneDeep(totals),
          statsByAuthor: _.cloneDeep(statsByAuthor),
        };

        data.push(dataPoint);
        next += interval;
      }
    }).then(function () {
      data.push({
        date: new Date(significantSpan[1]),
        totals: _.cloneDeep(totals),
        statsByAuthor: _.cloneDeep(statsByAuthor),
      });

      return group(data);
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
          canceled: 0,
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
            canceled
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
              total: (build.stats.success || 0) + (build.stats.failed || 0) + (build.stats.pending || 0) + (build.stats.canceled || 0),
            },
            build.stats
          ),
        };

        data.push(dataPoint);
        next += interval;
      }
    }).then(() => data);
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

  static getRelatedCommitDataOwnershipRiver(issue) {
    if (!issue) {
      return [];
    }

    const getRelatedCommitsPage = (issue) => (page, perPage) => {
      return graphQl
        .query(
          `query($page: Int, $perPage: Int, $iid: Int!){
         issue (iid: $iid){
           commits (page: $page, perPage: $perPage) {
             count
             data {
               sha
               shortSha
               message
               messageHeader
               signature
               webUrl
               date
             }
           }
         }
       }`,
          { page, perPage, iid: issue.iid }
        )
        .then((resp) => resp.issue.commits);
    };
    return collectPages(getRelatedCommitsPage(issue)).map((commit) => {
      commit.date = new Date(commit.date);
      return commit;
    });
  }
}
