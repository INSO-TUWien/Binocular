'use strict';

import Database from '../../../database/database';
import { getHistoryForCommit } from '../../../database/utils.js';

export async function getOwnershipForCommits(latestBranchCommit) {
  // first get all commits (with parent data)
  const ownershipData = await Database.getOwnershipDataForCommits();
  // calculate history for this branch
  const history = getHistoryForCommit(latestBranchCommit, ownershipData);

  // only return commits of this branch
  return ownershipData.filter((d) => history.includes(d.sha));
}

export async function getBranches() {
  return Database.getAllBranches().then((resp) => resp.branches.data);
}

export async function getCommitDataForSha(sha) {
  return Database.getCommitDataForSha(sha);
}

export async function getFilenamesForBranch(branchName) {
  return Database.getFilenamesForBranch(branchName);
}

export async function getPreviousFilenames(filenames, branch) {
  //if this branch tracks file renames, we first have to find out how the relevant files were named in the past
  let filePathsWithPreviousNames = [];
  const previousFilenameObjects = {};
  if (branch.tracksFileRenames) {
    filePathsWithPreviousNames = await Database.getPreviousFilenamesForFilesOnBranch(branch.branch);
    //we only care about files that were renamed
    filePathsWithPreviousNames = filePathsWithPreviousNames.filter((pfn) => pfn.previousFileNames.length !== 0);
    //we only care about the previous names of selected files
    filePathsWithPreviousNames = filePathsWithPreviousNames.filter((pfn) => filenames.includes(pfn.path));
    //add these named to the filenames array
    for (const pfn of filePathsWithPreviousNames) {
      const pfnObj = [];
      for (const oldFile of pfn.previousFileNames) {
        pfnObj.push(oldFile);
      }
      previousFilenameObjects[pfn.path] = pfnObj;
    }
  }
  return previousFilenameObjects;
}
