'use strict';

import { collectPages, graphQl, traversePages } from '../../utils';
import _ from 'lodash';
import { getHistoryForCommit } from '../utils.js';

export default class Commits {
  static getCommitData(commitSpan, significantSpan) {
    const commitList = [];
    const significantSince = significantSpan[0];
    const significantUntil = significantSpan[1];
    //important: we do not use significantSince in the query directly
    // because we need a full commit history to add the `history` attribute to all commits.
    const getCommitsPage = (until) => (page, perPage) => {
      return graphQl
        .query(
          `query($page: Int, $perPage: Int, $until: Timestamp) {
             commits(page: $page, perPage: $perPage, until: $until) {
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
          { page, perPage, until },
        )
        .then((resp) => resp.commits);
    };

    return traversePages(getCommitsPage(significantUntil), (commit) => {
      commitList.push(commit);
    }).then(function () {
      const allCommits = commitList.sort((a, b) => new Date(b.date) - new Date(a.date));
      return allCommits.filter((c) => new Date(c.date) >= new Date(significantSince));
    });
  }

  //easier to fetch all commits first because all commits are needed for the history attribute
  static getCommitDataForSha(sha) {
    return this.getCommitData([new Date(0), new Date()], [new Date(0), new Date()]).then(
      (commits) => commits.filter((c) => c.sha === sha)[0],
    );
  }

  static getCommitDataWithFiles(commitSpan, significantSpan) {
    const commitList = [];
    const significantSince = significantSpan[0];
    const significantUntil = significantSpan[1];
    const getCommitsPage = (until) => (page, perPage) => {
      return graphQl
        .query(
          `query($page: Int, $perPage: Int, $until: Timestamp) {
            commits(page: $page, perPage: $perPage, until: $until) {
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
          { page, perPage, until },
        )
        .then((resp) => resp.commits);
    };

    return traversePages(getCommitsPage(significantUntil), (commit) => {
      commitList.push(commit);
    }).then(function () {
      const allCommits = commitList.sort((a, b) => new Date(b.date) - new Date(a.date));
      return allCommits.filter((c) => new Date(c.date) >= new Date(significantSince));
    });
  }

  static getCommitDataWithFilesAndOwnership(commitSpan, significantSpan) {
    const commitList = [];
    const significantSince = significantSpan[0];
    const significantUntil = significantSpan[1];
    const getCommitsPage = (until) => (page, perPage) => {
      return graphQl
        .query(
          `query($page: Int, $perPage: Int, $until: Timestamp) {
            commits(page: $page, perPage: $perPage, until: $until) {
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
                   lineCount
                   ownership {
                    user
                    hunks {
                      originalCommit
                      lines {
                        from
                        to
                      }
                    }
                   }
                   stats {additions,deletions},
                   hunks {newLines}
                 }
               }
             }
            }
          }`,
          { page, perPage, until },
        )
        .then((resp) => resp.commits);
    };

    return traversePages(getCommitsPage(significantUntil), (commit) => {
      commitList.push(commit);
    }).then(function () {
      const allCommits = commitList.sort((a, b) => new Date(b.date) - new Date(a.date));
      return allCommits.filter((c) => new Date(c.date) >= new Date(significantSince));
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
        {},
      )
      .then((resp) => resp.commits.data)
      .then((commits) => {
        const allCommits = commits.sort((a, b) => new Date(b.date) - new Date(a.date));
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
                  user
                  hunks {
                    originalCommit
                    lines {
                      from
                      to
                    }
                  }
                }
              }
            }
          }
        }
      `,
      )
      .then((res) => res.commit.files.data)
      .then((ownershipData) =>
        ownershipData.map((o) => {
          return {
            path: o.file.path,
            ownership: o.ownership,
          };
        }),
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
              parents
              files {
                data {
                  file {
                    path
                  }
                  action
                  ownership {
                    user
                    hunks {
                      originalCommit
                      lines {
                        from
                        to
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      )
      .then((res) => res.commits.data)
      .then((commits) =>
        commits.map((c) => {
          return {
            sha: c.sha,
            date: c.date,
            parents: c.parents,
            files: c.files.data.map((fileData) => {
              return {
                path: fileData.file.path,
                action: fileData.action,
                ownership: fileData.ownership,
              };
            }),
          };
        }),
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
        { file: file },
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
        `,
          )
          .then((commits) => {
            const allCommits = commits.commits.data;
            // TODO: history not calculated for all commits anymore!
            //addHistoryToAllCommits(allCommits);

            result.file.commits.data = result.file.commits.data.map((d) => {
              const c = d.commit;
              // const his = allCommits.filter((com) => com.sha === c.sha)[0].history;
              // c.history = his;
              c.history = getHistoryForCommit(c, allCommits).join();
              return c;
            });
            return result;
          });
      });
  }
}
