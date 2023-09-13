'use strict';

export default class GraphGeneration {
  static generateGitGraph(width, height, filteredCommits) {
    const steps_x = 25;
    const buffer_y = 300;
    const buffer_x = 100;
    const edges = [];

    const organizedCommits = this.organizeCommitsByBranch(filteredCommits);
    const { branchNames, numBranches, heights } = this.calculateBranchHeights(organizedCommits, height, buffer_y);

    const colors = this.generateRandomRGBColors(numBranches);

    const crossBranchParents = this.sortCrossBranchParents(filteredCommits, edges);

    const nodesData = [];
    this.generateNodes(branchNames, organizedCommits, heights, colors, crossBranchParents, nodesData, buffer_x, steps_x);

    const graph = {
      nodes: nodesData,
      edges: [...edges, ...crossBranchParents],
      branches: heights,
      organizedCommits: organizedCommits,
      crossBranchParents: crossBranchParents
    };

    return graph;
  }

  static generateNodes(branchNames, organizedCommits, heights, colors, crossBranchParents, nodesData, buffer_x, steps_x) {
    branchNames.forEach((branch, branchIndex) => {
      const branchCommits = organizedCommits[branch];
      const branchHeights = heights.find((pair) => pair.name === branch)?.height;
      const color = colors[branchIndex];

      let branch_offset = 0;
      branchCommits.forEach((commit, commitIndex) => {
        const parentCommit = crossBranchParents.find(c => c.to === commit.sha);

        const parentNode = nodesData.find(node => node.id === parentCommit?.from);
        const parentX = parentNode ? parentNode.x : 0;

        if (parentNode !== undefined) {
          branch_offset = parentX - buffer_x + steps_x;
        }

        const node = {
          id: commit.sha,
          label: `Commit ${commit.sha}`,
          x: parentCommit ? parentX + steps_x : steps_x * commitIndex + branch_offset + buffer_x,
          y: branchHeights, // You can adjust the y-coordinate as needed
          color: color,
          message: commit.message,
          signature: commit.signature,
          date: commit.date,
          branch: commit.branch,
        };
        nodesData.push(node);
      });
    });
  }

  static sortCrossBranchParents(filteredCommits, edges) {
    const crossBranchParents = [];
    filteredCommits.forEach((commit) => {
      if (commit.parents !== null) {
        commit.parents.split(',').forEach((parent) => {
          const parentCommit = filteredCommits.find(c => c.sha === parent);

          if (parentCommit && parentCommit.branch === commit.branch) {
            edges.push({ from: parent, to: commit.sha });
          } else if (parentCommit) {
            crossBranchParents.push({ from: parent, to: commit.sha });
          }
        });
      }
    });

    return crossBranchParents;
  }

  static calculateBranchHeights(organizedCommits, height, buffer_y) {
    const branchNames = Object.keys(organizedCommits);
    const numBranches = branchNames.length;

    const heights = branchNames.map((branch, index) => ({
      name: branch,
      height: (height / numBranches) * index + buffer_y,
    }));

    return { branchNames, numBranches, heights };
  }

  static organizeCommitsByBranch(filteredCommits) {
    const organizedCommits = filteredCommits.reduce((result, commit) => {
      const branch = commit.branch;

      if (!result[branch]) {
        result[branch] = [];
      }

      result[branch].push(commit);

      return result;
    }, {});

    return organizedCommits;
  }

  static generateRandomRGBColors(numBranches) {
    const colors = [];

    for (let i = 0; i < numBranches; i++) {
      const intensity = Math.floor((i / (numBranches - 1)) * 255);
      const red = 255;

      colors.push(`rgb(${red}, ${intensity}, ${intensity})`);
    }

    return colors;
  }
}
