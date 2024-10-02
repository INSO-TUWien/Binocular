'use strict';

import { graphQl } from '../../utils';

export default class Files {
  static requestFileStructure() {
    return graphQl.query(
      `
      query{
       files(sort: "ASC"){
          data{path,webUrl}
        }
      }
      `,
      {},
    );
  }

  static getFilenamesForBranch(branchName) {
    return graphQl
      .query(
        `
      query{
        branch(branchName: "${branchName}"){
          files{
            data{
              file{
                path
              }
            }
          }
        }
      }
      `,
        {},
      )
      .then((result) => result.branch.files.data.map((entry) => entry.file.path).sort());
  }

  static getPreviousFilenamesForFilesOnBranch(branchName) {
    return graphQl
      .query(
        `
      query{
        branch(branchName: "${branchName}") {
          files {
            data {
              file {
                path
                oldFileNames(branch: "${branchName}") {
                  data {
                    oldFilePath
                    hasThisNameFrom
                    hasThisNameUntil
                  }
                }
              }
            }
          }
        }
      }
      `,
        {},
      )
      .then((result) =>
        result.branch.files.data.map((entry) => {
          return { path: entry.file.path, previousFileNames: entry.file.oldFileNames.data };
        }),
      );
  }

  //TODO move this to ./commits.js
  //TODO: filter directly in the query
  static getFilesForCommits(hashes) {
    return graphQl
      .query(
        `query {
         commits {
          data {
            sha
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
      .then((commits) => commits.filter((c) => hashes.includes(c.sha)))
      .then((commits) => {
        const resultFiles = [];
        for (const commit of commits) {
          for (const file of commit.files.data) {
            resultFiles.push(file);
          }
        }
        //we only want one entry per file.
        // the [...new Set()] method does not work on objects.
        const result = [];
        const filePaths = [...new Set(resultFiles.map((r) => r.file.path))];
        for (const path of filePaths) {
          result.push(resultFiles.filter((f) => f.file.path === path)[0]);
        }
        return result;
      });
  }

  static getOwnershipDataForFiles(files) {
    files = files.map((f) => `"${f}"`);
    return graphQl
      .query(
        `query {
          files(paths: [${files}]) {
            data {
              path
              commits {
                data {
                  commit {
                    sha
                    date
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
       }`,
        {},
      )
      .then((resp) =>
        resp.files.data.map((d) => {
          return {
            path: d.path,
            ownership: d.commits.data,
          };
        }),
      );
  }
}
