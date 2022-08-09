'use strict';

const Promise = require('bluebird');
const isomorphicGit = require('isomorphic-git');
const path = require('path');
const fs = require('fs');

function Repository(/*repo,*/ path, currPath) {
  this.path = path;
  this.currPath = currPath;
}

Repository.fromPath = function (currPath) {
  return Promise.resolve(isomorphicGit.init({ fs, dir: currPath || '.' })).then(() => {
    return Promise.resolve(new Repository(path.resolve(currPath + '/.git'), currPath || '.'));
  });
};

Repository.fromRepo = function (repo) {
  return Promise.resolve(new Repository(repo, repo.path()));
};

module.exports = Repository;

Repository.prototype.getAllBranches = function () {
  return isomorphicGit.listBranches({ fs, dir: this.currPath || '.', remote: 'origin' });
};

Repository.prototype.getRoot = function () {
  return path.resolve(this.path, '..');
};

Repository.prototype.getPath = function () {
  return path.resolve(this.path);
};

Repository.prototype.getName = function () {
  return path.basename(path.dirname(this.path));
};

Repository.prototype.pathFromRoot = function (/* ...args */) {
  return path.resolve(this.getRoot(), ...arguments);
};

Repository.prototype.getHeadPath = function () {
  return path.resolve(this.path, 'FETCH_HEAD');
};

Repository.prototype.getCurrentBranch = async function () {
  return isomorphicGit.currentBranch({ fs, dir: this.currPath || '.' });
};

Repository.prototype.getOriginUrl = async function () {
  const remotes = await isomorphicGit.listRemotes({ fs, dir: this.currPath || '.' });
  return remotes[0].url;
};

Repository.prototype.listAllCommits = async function () {
  let branches = await this.getAllBranches();
  const commits = [];
  branches = branches.filter((b) => b !== 'HEAD').reverse();
  for (const b of branches) {
    let branchCommits = await isomorphicGit.log({
      fs,
      dir: this.currPath || '.',
      ref: 'origin/' + b,
    });
    branchCommits = branchCommits.reverse();
    branchCommits = branchCommits.map((c) => {
      c.commit.branch = b;
      return c;
    });
    branchCommits.forEach((commit) => {
      if (commits.find((c) => c.oid === commit.oid) === undefined) {
        commits.push(commit);
      }
    });
  }
  return commits;
};

Repository.prototype.getCommitChanges = async function (repo, sha, parentSha, mapFunction) {
  const files = sha === undefined ? [] : await isomorphicGit.listFiles({ fs, dir: repo.currPath || '.', ref: sha });
  const parentFiles = parentSha === undefined ? [] : await isomorphicGit.listFiles({ fs, dir: repo.currPath || '.', ref: parentSha });

  return isomorphicGit.walk({
    fs,
    dir: repo.currPath || '.',
    trees: [isomorphicGit.TREE({ ref: parentSha }), isomorphicGit.TREE({ ref: sha })],
    map: async function (filepath, [parentEntry, currentEntry]) {
      return mapFunction(filepath, parentEntry, currentEntry, files, parentFiles);
    },
  });
};
