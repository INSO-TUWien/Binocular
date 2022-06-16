'use strict';

import { collectPages, graphQl } from '../../../utils';


export function getCommitsForIssue(iid) {

  return collectPages(getCommitsForIssuePage(iid)).map(commit => {
    commit.date = new Date(commit.date);
    return commit;
  });
}

const getCommitsForIssuePage = iid => (page, perPage) => {
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

//TODO filter in query, not afterwards
export function getAllCommits() {
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
          }
         }
       }`,
      {}
    ).then(resp => resp.commits.data)
}


//recursively get all parent commits of latestCommit.
//used to get all commits of a branch
export function getCommitsForBranch(latestCommit, allCommits) {

  //array to accumulate commits
  //race conditions should be no problem since recursive calls will not be multi-threaded
  //TODO
  let r = []

  function recursiveFun(currentCommit) {

    //if this commit is already in r, then c's parents are also already present. return in this case
    if(r.filter(c => c.sha == currentCommit.sha).length > 0) {
      return
    }

    //if commit is not present, add it
    r = r.concat([currentCommit])
      
    //if commit has no parents, this 'branch' of the tree is done. return
    if(!currentCommit.parents) {
      return
    }

    let parentsSha = currentCommit.parents.split(",")
    for(const sha of parentsSha) {
      let pCommit = allCommits.filter(c => c.sha == sha)
      if(pCommit.length > 0) {
        recursiveFun(pCommit[0])
      }
    }
    return
  }
  
  //start the recursive function with the latest commit of the desired branch
  recursiveFun(latestCommit)

  return r
}