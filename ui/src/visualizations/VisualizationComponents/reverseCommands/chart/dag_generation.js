'use strict';

function organizeCommitsIntoBranches(commits) {
  const organizedCommits = commits.reduce((result, commit) => {
    const branch = commit.branch;

    if (!result[branch]) {
      result[branch] = [];
    }

    result[branch].push(commit);

    return result;
  }, {});
  return organizedCommits;
}

function getNumberOfBranches(commits) {
  const organizedCommits = organizeCommitsIntoBranches(commits);
  const branchNames = Object.keys(organizedCommits);
  return branchNames.length;
}

function calculateBranchHeights(branchNames, height, numBranches, buffer_y) {
  const heights = branchNames.map((branch, index) => ({
    name: branch,
    height: (height / numBranches) * index + buffer_y,
  }));
  return heights;
}

function organizeEdges(commits) {
  const crossBranchParents = [];
  const edges = [];
  commits.forEach((commit) => {
    if (commit.parents !== null) {
      commit.parents.split(',').forEach((parent) => {
        const parentCommit = commits.find((c) => c.sha === parent);

        if (parentCommit && parentCommit.branch === commit.branch) {
          edges.push({ from: parent, to: commit.sha });
        } else if (parentCommit) {
          crossBranchParents.push({ from: parent, to: commit.sha });
        }
      });
    }
  });
  return { edges: edges, crossBranchRelationships: crossBranchParents };
}

function getNumOfParentsInSameBranch(commit) {
  const organizedEdges = organizeEdges().edges;
}
