'use strict';

import { graphQl } from '../../../../utils';

/**
 * Gets all files with their respective commits
 * @returns {*} (see below)
 */
export default function getCommitFiles() {
  let since = Date.parse("2016-07-09T03:17:02Z");
  let until = Date.parse("2022-08-08T11:31:27Z");

  return graphQl
    .query(
      `query($since: Timestamp, $until: Timestamp){
        commitsFiles: commits(since: $since, until: $until) {
          data {
              sha
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