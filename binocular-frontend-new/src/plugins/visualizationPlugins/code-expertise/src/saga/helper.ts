'use strict';

import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';

export async function getOwnershipForCommits(dataConnection: DataPlugin) {
  //const ownershipData = await Database.getOwnershipDataForCommits();
  const ownershipData = await dataConnection.commits.getOwnershipDataForCommits();

  // only return commits of this branch
  return ownershipData;
}

export async function getBranches(dataConnection: DataPlugin) {
  return await dataConnection.branches!.getAllBranches();
}

export function getDefaultBranch(branches: DataPluginBranch[]): DataPluginBranch {
  let branch = branches.find((branch) => branch.branch == 'main' || branch.branch == 'master');
  if (!branch) branch = branches.find((branch) => branch.branch == 'develop' || branch.branch == 'dev');
  return branch ? branch : branches[0];
}
