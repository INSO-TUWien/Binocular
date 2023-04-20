'use strict';

import { collectPages, graphQl } from '../../../utils';
import { endpointUrl } from '../../../utils';
import _ from 'lodash';

//get the blame data for a specific commit and for specific files
export function getBlameModules(sha, files) {
  return fetch(endpointUrl('blame/modules'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sha: sha,
      files: files,
    }),
  }).then((resp) => resp.json());
}

//get the blame data for a specific commit and for specific files
export function getBlameIssues(sha, files, hashes) {
  return fetch(endpointUrl('blame/issues'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sha: sha,
      files: files,
      hashes: hashes,
    }),
  }).then((resp) => resp.json());
}

export function getCommitsForIssue(iid) {
  return collectPages(getCommitsForIssuePage(iid)).then((commits) => {
    return commits.map((commit) => {
      commit.date = new Date(commit.date);
      return commit;
    });
  });
}

const getCommitsForIssuePage = (iid) => (page, perPage) => {
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
    .then((resp) => {
      return resp.issue.commits;
    });
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
      { iid }
    )
    .then((resp) => resp.issue);
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
    )
    .then((resp) => resp.builds.data);
}

export function getBranches() {
  return graphQl
    .query(
      `query{
      branches(sort: "ASC"){
        data{branch,active,latestCommit}
      }
    }`,
      {}
    )
    .then((resp) => resp.branches.data);
}

export function addBuildData(relevantCommits, builds) {
  return relevantCommits.map((commit) => {
    const resultCommit = commit;
    resultCommit['build'] = null;
    const relevantBuilds = builds.filter((build) => build.sha === commit.sha);
    if (relevantBuilds.length > 0) {
      resultCommit['build'] = relevantBuilds[0].status;
      resultCommit['buildUrl'] = relevantBuilds[0].webUrl;
    }
    return resultCommit;
  });
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
            history,
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
    )
    .then((resp) => resp.commits.data);
}

//recursively get all parent commits of the selected branch.
export function getCommitsForBranch(branch, allCommits) {
  const latestCommitSha = branch.latestCommit;
  const latestCommit = allCommits.filter((commit) => commit.sha === latestCommitSha)[0];
  const history = latestCommit.history.split(',');
  return allCommits.filter((c) => _.includes(history, c.sha));
}
