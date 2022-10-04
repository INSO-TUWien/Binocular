'use strict';

import { graphQl } from '../../../../utils';

/**
 * Gets all commits with their respective modules
 * @returns {*} (see below)
 */
export default function getCommitsModules() {
  let since = Date.parse("2021-07-09T03:17:02Z");
  let until = Date.parse("2022-08-08T11:31:27Z");

  return graphQl
    .query(
      `query($since: Timestamp, $until: Timestamp){
        commitsModules: commits(since: $since, until: $until) {
          data {
              sha
              modules {
                data {
                  module {
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
        commitsModules: resp.commitsModules.data
    }));
};