'use strict';

import Database from '../../../database/database';
import _ from 'lodash';

export async function getOwnershipForCommits(history) {
  console.time('fetchOwnershipData');
  const ownershipData = await Database.getOwnershipDataForCommits();
  console.timeEnd('fetchOwnershipData');
  return ownershipData.filter((d) => history.includes(d.sha));
}

export async function getBranches() {
  return Database.getAllBranches().then((resp) => resp.branches.data);
}

export async function getCommitDataForSha(sha) {
  return Database.getCommitDataForSha(sha).then((resp) => resp.commit);
}
