'use strict';

import { collectPages, graphQl } from '../../../utils';
import { endpointUrl } from '../../../utils';

//get the blame data for a specific commit and for specific files
export function getBlameModules(sha, files) {

  console.log(sha, files)

  return fetch(endpointUrl('blame/modules'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sha: sha,
      files: files
    })
  }).then((resp) => resp.json());
}

//get the blame data for a specific commit and for specific files
export function getBlameIssues(sha, files, hashes) {

  console.log(sha, files)

  return fetch(endpointUrl('blame/issues'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sha: sha,
      files: files,
      hashes: hashes
    })
  }).then((resp) => resp.json());
}


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

export function getAllBuildData() {
  return graphQl
    .query(
      `query {
        builds {
          count
          data {
            sha
            status
            webUrl
          }
        }
      }`,
      {}
    ).then(resp => resp.builds.data)

}

export function addBuildData(relevantCommits, builds) {
  return relevantCommits
    .map(commit => {
      let resultCommit = commit
      resultCommit['build'] = null
      const relevantBuilds = builds.filter(build => build.sha == commit.sha)
      if (relevantBuilds.length > 0) {
        resultCommit['build'] = relevantBuilds[0].status
        resultCommit['buildUrl'] = relevantBuilds[0].webUrl
      }
      return resultCommit
    })
}

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
    ).then(resp => resp.commits.data)
}


//recursively get all parent commits of the selected branch.
export function getCommitsForBranch(branch, allCommits) {

  //get most recent commit for current branch
  const latestCommit = allCommits
  .map(commit => Object.assign({}, commit, {branch: commit.branch.replace(/(?:\r\n|\r|\n)/g, '')})) //remove newlines
  .filter(commit => commit.branch.endsWith(branch)) //get commits that are assigned to branch
  .sort((a,b) => (new Date(b.date) - new Date(a.date)))[0] //get the most recent

  //array to accumulate commits
  //race conditions should be no problem since recursive calls will not be multi-threaded
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