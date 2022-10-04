'use strict';

import { graphQl } from '../../../../utils';

/**
 * Gets all files with their respective commits
 * @returns {*} (see below)
 */
export default function getCommitFiles(since, until) {
  
  return graphQl
    .query(
      `query($since: Timestamp, $until: Timestamp){
        commitsFiles: commits(since: $since, until: $until) {
          data {
              sha
              date
              files {
                data {
                  file {
                    path
                  }
                }
              }
          }
        }
      }`,
      { since, until }
    )
    .then((resp) => ({
      commitsFiles: resp.commitsFiles.data
    }));
};