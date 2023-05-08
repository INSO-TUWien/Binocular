'use strict';

import { traversePages, graphQl } from '../../../../utils';
import { createEnum } from '../../../../utils/Enum';

/**
 * Get commit data from the database.
 * @param significantSpan Array of two time values (ms), first significant and last significant commit
 * (only these will actually be returned, used for zooming, the rest of the time will be empty data).
 * @returns {*}
 */
export default function getCommitData(significantSpan = []) {
  const commitList = [];

  return traversePages(getCommitsPage(significantSpan[1]), (commit) => {
    commitList.push(commit);
  }).then(function () {
    return commitList;
  });
}

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
             date
             messageHeader
             signature
              stats {additions,deletions}
              languages {
                data {
                  language {
                    name
                  },
                  stats {additions,deletions}
                }
              }
            modules{
              data {
                module{
                  path
                }
                stats {additions,deletions}
              }
            }
           }
         }
      }`,
      { page, perPage, until }
    )
    .then((resp) => resp.commits);
};

export const Attribute = createEnum(['Modules', 'Languages']);
