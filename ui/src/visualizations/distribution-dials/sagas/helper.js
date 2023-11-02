'use strict';

import Database from '../../../database/database';

const minDate = new Date(0);
const maxDate = new Date();

export async function getBranches() {
  return Database.getAllBranches().then((resp) => resp.branches.data);
}

export async function getFilenamesForBranch(branchName) {
  return Database.getFilenamesForBranch(branchName);
}

export function getCommits() {
  return Database.getCommitData([minDate, maxDate], [minDate, maxDate]);
}

export function getIssues() {
  return Database.getIssueData([minDate, maxDate], [minDate, maxDate]);
}

export function getBuilds() {
  return Database.getBuildData([minDate, maxDate], [minDate, maxDate]);
}
