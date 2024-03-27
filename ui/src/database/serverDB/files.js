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

  static getFileDataFileEvolutionDendrogram(activeBranch, since, until) {

    const getFileCommits = (activeBranch, since, until) => {
      return graphQl
        .query(
          `query ($since: Timestamp, $until: Timestamp) {
            files {
              data {
                path
                webUrl
                commits (since: $since, until: $until) {
                  data {
                    commit {
                      branch
                      signature
                    }
                    hunks{
                      newLines
                      oldLines
                    }
                  }
                }
              }
            }
          }`,
          {activeBranch, since, until}
        )
        .then((resp) => resp.files.data.map((file) => {
          const statsByAuthor = {};
          const totalStats = {
            count: 0,
            linesChanged: 0,
          };
    
          _.each(file.commits.data, function (commit) {
            if (activeBranch !== 'No Branch Chosen' && commit.commit.branch !== activeBranch ) {
              return;
            }

            let linesChanged = 0;
            _.each(commit.hunks, function (hunks) {
              linesChanged = linesChanged + hunks.newLines + hunks.oldLines;
            });


            let stats = statsByAuthor[commit.commit.signature];
            if (!stats) {
              stats = statsByAuthor[commit.commit.signature] = {
                count: 0,
                linesChanged: 0,
                author: commit.commit.signature,
              };
            }
    
            stats.count = stats.count + 1;
            stats.linesChanged = stats.linesChanged + linesChanged;
    
            totalStats.count = totalStats.count + 1;
            totalStats.linesChanged = totalStats.linesChanged + linesChanged;
          });
    
    
          const returnFile = {
            path: file.path,
            webUrl: file.webUrl,
            totalStats: totalStats,
            statsByAuthor: statsByAuthor,
          };
          return returnFile;
        }));
    };

    return getFileCommits(activeBranch, since, until);
  }
}
