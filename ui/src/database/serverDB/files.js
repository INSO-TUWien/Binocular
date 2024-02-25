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
                    branch
                    signature
                    stats {
                      additions
                      deletions
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
            if (activeBranch !== 'No Branch Chosen' && commit.branch !== activeBranch ) {
              return;
            }
            let stats = statsByAuthor[commit.signature];
            if (!stats) {
              stats = statsByAuthor[commit.signature] = {
                count: 0,
                linesChanged: 0,
                author: commit.signature,
              };
            }
    
            stats.count = stats.count + 1;
            stats.linesChanged = stats.linesChanged + commit.stats.additions + commit.stats.deletions;
    
            totalStats.count = totalStats.count + 1;
            totalStats.linesChanged = totalStats.linesChanged + commit.stats.additions + commit.stats.deletions;
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
