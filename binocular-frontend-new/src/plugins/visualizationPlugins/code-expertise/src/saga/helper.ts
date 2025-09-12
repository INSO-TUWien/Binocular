'use strict';

import { getHistoryForCommit } from '../utilities/dbUtils.ts';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { PreviousFileData } from '../../../../../types/data/ownershipType.ts';
import { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';

export async function getOwnershipForCommits(latestBranchCommit: DataPluginCommit, dataConnection: DataPlugin) {
  // first get all commits (with parent data)
  //const ownershipData = await Database.getOwnershipDataForCommits();
  const ownershipData = await dataConnection.commits.getOwnershipDataForCommits();

  // calculate history for this branch
  const history = getHistoryForCommit(latestBranchCommit, ownershipData);

  // only return commits of this branch
  return ownershipData.filter((d: { sha: string }) => history.includes(d.sha));
}

export async function getBranches(dataConnection: DataPlugin) {
  return await dataConnection.branches!.getAllBranches();
}

export async function getCommitDataForSha(sha: string, dataConnection: DataPlugin) {
  return await dataConnection.commits.getCommitDataForSha(sha);
}

export async function getFilenamesForBranch(branchName: string, dataConnection: DataPlugin) {
  return dataConnection.files.getFilenamesForBranch(branchName);
}

export async function getPreviousFilenames(filenames: string[], branch: DataPluginBranch, dataConnection: DataPlugin) {
  //if this branch tracks file renames, we first have to find out how the relevant files were named in the past
  let filePathsWithPreviousNames: { path: string; previousFileNames: PreviousFileData[] }[] = [];
  const previousFilenameObjects: { [id: string]: PreviousFileData[] } = {};
  if (branch.tracksFileRenames) {
    filePathsWithPreviousNames = await dataConnection.files.getPreviousFilenamesForFilesOnBranch(branch.branch);
    //we only care about files that were renamed
    filePathsWithPreviousNames = filePathsWithPreviousNames.filter(
      (pfn: { previousFileNames: PreviousFileData[] }) => pfn.previousFileNames.length !== 0,
    );
    //we only care about the previous names of selected files
    filePathsWithPreviousNames = filePathsWithPreviousNames.filter((pfn: { path: string }) => filenames.includes(pfn.path));
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

export function getDefaultBranch(branches: DataPluginBranch[]): DataPluginBranch {
  let branch = branches.find((branch) => branch.branch == 'develop' || branch.branch == 'dev');
  if (!branch) branch = branches.find((branch) => branch.branch == 'main' || branch.branch == 'master');
  return branch ? branch : branches[0];
}
