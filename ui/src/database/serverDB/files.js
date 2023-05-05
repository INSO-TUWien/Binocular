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
      {}
    );
  }

  static getFilenamesForBranch(branchName) {
    return graphQl.query(
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
      `,{}
    ).then((result) => result.branch.files.data.map(entry => entry.file.path).sort());
  }

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
                stats {additions,deletions},
                hunks {newLines}
              }
            }
          }
         }
       }`,
      {}
    )
    .then((resp) => resp.commits.data)
    .then((commits) => commits.filter((c) => hashes.includes(c.sha)))
    .then((commits) => {
      const result = [];
      for(const commit of commits) {
        for (const file of commit.files.data) {
          result.push(file)
        }        
      }
      return result;
    });
  }
}
