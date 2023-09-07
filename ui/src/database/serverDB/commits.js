'use strict';

import { collectPages, graphQl, traversePages } from '../../utils';
import _ from 'lodash';
import moment from 'moment/moment';
import { addHistoryToAllCommits } from '../utils';

export default class Commits {
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
                 shortSha
                 message
                 messageHeader
                 signature
                 branch
                 parents
                 date
                 webUrl
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
      const allCommits = commitList.sort((a, b) => new Date(b.date) - new Date(a.date));
      addHistoryToAllCommits(allCommits);
      return allCommits;
    });
  }

  //easier to fetch all commits first because all commits are needed for the history attribute
  static getCommitDataForSha(sha) {
    return this.getCommitData([new Date(0), new Date()], [new Date(0), new Date()]).then(
      (commits) => commits.filter((c) => c.sha === sha)[0]
    );
  }

  static getCommitDataWithFiles(commitSpan, significantSpan) {
    const commitList = [];
    const getCommitsPage = (since, until) => (page, perPage) => {
      return graphQl
        .query(
          `query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
            commits(page: $page, perPage: $perPage, since: $since, until: $until) {
             count,
             page,
             perPage,
             data {
               sha,
               branch,
               message,
               signature,
               webUrl,
               date,
               parents,
               stats {
                 additions,
                 deletions
               }
               files{
                 data {
                   file{
                     path
                   }
                   stats {additions,deletions},
                   hunks {newLines}
                 }
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
      const allCommits = commitList.sort((a, b) => new Date(b.date) - new Date(a.date));
      addHistoryToAllCommits(allCommits);
      return allCommits;
    });
  }

  static getCommitDataWithFilesAndOwnership(commitSpan, significantSpan) {
    const commitList = [];
    const getCommitsPage = (since, until) => (page, perPage) => {
      return graphQl
        .query(
          `query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
            commits(page: $page, perPage: $perPage, since: $since, until: $until) {
             count,
             page,
             perPage,
             data {
               sha,
               branch,
               message,
               signature,
               webUrl,
               date,
               parents,
               stats {
                 additions,
                 deletions
               }
               files{
                 data {
                   file{
                     path
                   }
                   ownership {
                    stakeholder
                    ownedLines
                  }
                   stats {additions,deletions},
                   hunks {newLines}
                 }
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
      const allCommits = commitList.sort((a, b) => new Date(b.date) - new Date(a.date));
      addHistoryToAllCommits(allCommits);
      return allCommits;
    });
  }

  static getCommitsForFiles(filenames, omitFiles) {
    return graphQl
      .query(
        `query {
         commits {
          count,
          data {
            sha,
            branch,
            message,
            signature,
            webUrl,
            date,
            parents,
            stats {
              additions,
              deletions
            }
            files{
              data {
                file{
                  path
                }
              }
            }
          }
         }
       }`,
        {}
      )
      .then((resp) => resp.commits.data)
      .then((commits) => {
        const allCommits = commits.sort((a, b) => new Date(b.date) - new Date(a.date));
        addHistoryToAllCommits(allCommits);
        const result = [];
        for (const commit of allCommits) {
          for (const cFile of commit.files.data) {
            if (filenames.includes(cFile.file.path)) {
              //this function should only return the commit data. We do not need the files entry anymore
              if (omitFiles) {
                result.push(_.omit(commit, 'files'));
              } else {
                result.push(commit);
              }
              break;
            }
          }
        }
        return result;
      });
  }

  static getOwnershipDataForCommit(sha) {
    return graphQl
      .query(
        `
        query {
          commit(sha: "${sha}") {
            files {
              data {
                file {
                  path
                }
                ownership {
                  stakeholder
                  ownedLines
                }
              }
            }
          }
        }
      `
      )
      .then((res) => res.commit.files.data)
      .then((ownershipData) =>
        ownershipData.map((o) => {
          return {
            path: o.file.path,
            ownership: o.ownership,
          };
        })
      );
  }

  static getOwnershipDataForCommits() {
    return graphQl
      .query(
        `
        query {
          commits {
            data {
              sha
              date
              files {
                data {
                  file {
                    path
                  }
                  action
                  ownership {
                    stakeholder
                    ownedLines
                  }
                }
              }
            }
          }
        }
      `
      )
      .then((res) => res.commits.data)
      .then((commits) =>
        commits.map((c) => {
          return {
            sha: c.sha,
            date: c.date,
            files: c.files.data.map((fileData) => {
              return {
                path: fileData.file.path,
                action: fileData.action,
                ownership: fileData.ownership,
              };
            }),
          };
        })
      );
  }

  static getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval, excludeMergeCommits) {
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
                 message
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
      if (excludeMergeCommits && commit.message.includes('Merge')) {
        return;
      }

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

  static getCommitDateHistogram(granularity, dateField, since, until) {
    return graphQl.query(
      `query($granularity: DateGranularity!, $dateField: String!, $since: Timestamp, $until: Timestamp) {
           commitDateHistogram(granularity: $granularity, since: $since, until: $until) {
             category
             count
           }
           goodCommits: commitDateHistogram(granularity: $granularity, buildFilter: successful, since: $since, until: $until) {
             category
             count
           }
           badCommits: commitDateHistogram(granularity: $granularity, buildFilter: failed, since: $since, until: $until) {
             category
             count
           }
           issueDateHistogram(granularity: $granularity, dateField: $dateField, since: $since, until: $until) {
             category
             count
           }
         }`,
      {
        granularity: granularity,
        dateField: dateField,
        since: since,
        until: until,
      }
    );
  }

  static getCodeHotspotsChangeData(file) {
    return graphQl
      .query(
        `
        query($file: String!) {
          file(path: $file){
              path
              maxLength
              commits{
                  data{
                    commit{
                      message
                      sha
                      signature
                      branch
                      parents
                      date
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
      )
      .then((result) => {
        //get all commits, calculate history, append history to all originally fetched commits
        return graphQl
          .query(
            `
          query {
            commits {
              data {
                sha
                date
                parents
              }
            }
        }
        `
          )
          .then((commits) => {
            const allCommits = commits.commits.data;
            addHistoryToAllCommits(allCommits);

            result.file.commits.data = result.file.commits.data.map((d) => {
              let c = d.commit;
              let his = allCommits.filter((com) => com.sha === c.sha)[0].history;
              c.history = his;
              return c;
            });
            return result;
          });
      });
  }
}
