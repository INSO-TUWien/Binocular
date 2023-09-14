'use strict';

const _ = require('lodash');

export const addHistoryToAllCommits = (allCommits) => {
  //stores the histories of all commits
  let historycache = {};

  //sort so oldest commit is first
  const commits = allCommits.sort((a, b) => new Date(a.date) - new Date(b.date));
  const commitsShas = commits.map((c) => c.sha);
  let positions = {};
  for (let i = 0; i < commitsShas.length; i++) {
    positions[commitsShas[i]] = i;
  }

  //for all commits that do not have parents, add them to the cache
  //necessary for gitlab projects that can have multiple initial commits
  const initialCommits = allCommits.filter((c) => c.parents.length === 0);

  let children = [];
  let frontier = [];

  for (const genesis of initialCommits) {
    historycache[genesis.sha] = [genesis.sha];
    //find all children of genesis
    children = children.concat(allCommits.filter((child) => child.parents.includes(genesis.sha)));
  }

  for (const child of children) {
    frontier.push(child);
  }
  frontier = _.uniqBy(frontier, (c) => c.sha);

  const helper = (commit) => {
    let history = [commit.sha];
    for (const p of commit.parents) {
      if (!historycache[p]) {
        frontier.push(commit);
        return;
      }
      history = history.concat(historycache[p]);
    }
    history = _.uniq(history).sort((a, b) => positions[b] - positions[a]);
    historycache[commit.sha] = history;

    commit.history = history.join();

    //find all children of commit
    const children = allCommits.filter((child) => child.parents.includes(commit.sha));
    for (const child of children) {
      if (!historycache[child.sha]) {
        frontier.unshift(child);
      }
    }
  };

  while (frontier.length !== 0) {
    helper(frontier.shift());
  }
};
