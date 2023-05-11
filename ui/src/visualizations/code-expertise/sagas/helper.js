'use strict';

import { collectPages, graphQl } from '../../../utils';
import { endpointUrl } from '../../../utils';
import Database from '../../../database/database';
import _ from 'lodash';

const minDate = new Date(0);
const maxDate = new Date();

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

export function getIssues() {
  return Database.getIssueData([],[minDate,maxDate]);
}

export function getCommitsForIssue(iid) {
  return Database.getCommitsForIssue(iid);
};

export function getCommitsForFiles(filenames) {
  return Database.getCommitsForFiles(filenames);
}

export function getIssueData(iid) {
  //TODO use separate function that only queries for specific issue
  return getIssues().then((resp) => resp.filter(i => i.iid === parseInt(iid))[0]);
}

export function getAllBuildData() {
  return Database.getBuildData([], [minDate, maxDate]);
}

export function getBranches() {
  return Database.getAllBranches().then((resp) => resp.branches.data);
}

export function getFilenamesForBranch(branchName) {
  return Database.getFilenamesForBranch(branchName);
}

export function getFilesForCommits(hashes) {
  return Database.getFilesForCommits(hashes)
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
  return Database.getCommitDataWithFiles();
  return Database.getCommitData([], [minDate, maxDate]);
}

//recursively get all parent commits of the selected branch.
export function getCommitsForBranch(branch, allCommits) {
  const latestCommitSha = branch.latestCommit;
  const latestCommit = allCommits.filter((commit) => commit.sha === latestCommitSha)[0];
  const history = latestCommit.history.split(',');
  return allCommits.filter((c) => _.includes(history, c.sha));
}
