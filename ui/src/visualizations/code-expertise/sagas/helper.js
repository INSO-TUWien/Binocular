'use strict';

import { collectPages, graphQl } from '../../../utils';


export function getRelatedCommits(iid) {

  return collectPages(getRelatedCommitsPage(iid)).map(commit => {
    commit.date = new Date(commit.date);
    return commit;
  });
}

const getRelatedCommitsPage = iid => (page, perPage) => {
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
              stats {
                additions
                deletions
              }
            }
          }
         }
       }`,
      { page, perPage, iid }
    )
    .then(resp => resp.issue.commits);
};


export function getIssueData(iid) {
  return graphQl
    .query(
      `query($iid: Int!){
         issue (iid: $iid){
          iid,
          title,
          createdAt,
          closedAt,
          webUrl
         }
       }`,
      {iid}
    ).then(resp => resp.issue)
}
