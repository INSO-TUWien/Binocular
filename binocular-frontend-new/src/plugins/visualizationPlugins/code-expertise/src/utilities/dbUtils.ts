'use strict';

// Returns an array of commit hashes that represent the history of this commit.
// Array is in reverse order, starting with the sha of the commit in question.
// History is calculated by following the parent commits back to the genesis commit of the project.
// every element of allCommits must have the `sha`, `date` and `parents` attributes.
// Note: We can't rely on the fact that parent commits have a `date` <= the `date` commit in question
//  (see e.g. https://softwareengineering.stackexchange.com/questions/314761/github-parent-commit-committed-after-child-commit)
//  So it is not enough that `allCommits` contains all commits with date <= the date of the commit in question.
//  To be safe, `allCommits` should really contain all commits of the project.
//  Otherwise, this function may return wrong results (if there are commits in the history that have a `date` > the `commit` date).
import type { DataPluginCommit, DataPluginOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export const getHistoryForCommit = (commit: DataPluginCommit, allCommits: DataPluginOwnership[]) => {
  // each commit only has the hash of the parent. Build a map, so we can get the actual commit for a given sha.
  const commitsForSha: { [id: string]: DataPluginOwnership } = {};
  allCommits.forEach((c) => {
    commitsForSha[c.sha] = c;
  });

  const history: (DataPluginCommit | DataPluginOwnership)[] = [commit];

  // recursively add parents to history
  const addParentsToHistory = (c: { parents: (string | number)[] }) => {
    // if we reach the first commit, we are done
    if (!c.parents || c.parents.length === 0) return;
    // add each parent to the history (if it is not already there
    c.parents.forEach((p: string | number) => {
      const parent = commitsForSha[p];
      if (!history.includes(parent)) {
        history.push(parent);
        // continue with parents of parent
        addParentsToHistory(parent);
      }
    });
  };

  // kick off recursive function with the commit for which we want to get the history
  addParentsToHistory(commit);

  // sort by date (newest first). Only return the hashes of the commits
  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((c) => c.sha);
};
