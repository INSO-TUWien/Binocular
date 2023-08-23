'use strict';

import Database from '../../../database/database';
import _ from 'lodash';

export async function getOwnershipForCommits(history) {
  const ownershipData = await Database.getOwnershipDataForCommits();
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
      let pfnObj = [];
      for (const oldFile of pfn.previousFileNames) {
        pfnObj.push(oldFile);
      }
      previousFilenameObjects[pfn.path] = pfnObj;
    }
  }
  return previousFilenameObjects;
}

//returns an object with filepaths as keys and the most recent ownership data for each file as values
export function extractFileOwnership(ownershipData) {
  //(copy and) reverse array so we have the most recent commits first
  const commits = ownershipData.toReversed();
  const result = {};
  for (const commit of commits) {
    for (const file of commit.files) {
      //since we start with the most recent commit, we are only interested in the first occurence of each file
      //and because this is used for the filepicker, we are also not concerned about file renames
      if (!result[file.path]) {
        result[file.path] = file.ownership;
      }
    }
  }
  return result;
}
