'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const isomorphicGit = require('isomorphic-git');
const path = require('path');
const fs = require('fs');

function Repository(/*repo,*/ path) {
  this.path = path;
}

Repository.fromPath = function (currPath) {
  return Promise.resolve(isomorphicGit.init({ fs, dir: currPath || '.' })).then(() => {
    return Promise.resolve(new Repository(path.resolve('.git')));
  });
};

Repository.fromRepo = function (repo) {
  return Promise.resolve(new Repository(repo, repo.path()));
};

module.exports = Repository;

Repository.prototype.getAllBranches = function () {
  return isomorphicGit.listBranches({ fs, dir: '.', remote: 'origin' });
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
  return isomorphicGit.currentBranch({ fs, dir: '.' });
};

Repository.prototype.getOriginUrl = async function () {
  const remotes = await isomorphicGit.listRemotes({ fs, dir: '.' });
  return remotes[0].url;
};

Repository.prototype.listAllCommits = async function () {
  let branches = await this.getAllBranches();
  let commits = [];
  branches = branches.filter((b) => b !== 'HEAD');
  branches = branches.filter((b) => b !== 'main');
  branches.unshift('main');
  for (const b of branches) {
    let branchCommits = await isomorphicGit.log({
      fs,
      dir: '.',
      ref: 'origin/' + b,
    });
    branchCommits = branchCommits.reverse();
    branchCommits = branchCommits.map((c) => {
      c.commit.branch = b;
      return c;
    });
    commits = _.unionBy(commits, branchCommits, 'oid');
  }
  return commits;
};

Repository.prototype.getCommitChanges = async function (sha, parentSha, mapFunction) {
  const files = sha === undefined ? [] : await isomorphicGit.listFiles({ fs, dir: '.', ref: sha });
  const parentFiles = parentSha === undefined ? [] : await isomorphicGit.listFiles({ fs, dir: '.', ref: parentSha });

  return isomorphicGit.walk({
    fs,
    dir: '.',
    trees: [isomorphicGit.TREE({ ref: parentSha }), isomorphicGit.TREE({ ref: sha })],
    map: async function (filepath, [parentEntry, currentEntry]) {
      return mapFunction(filepath, parentEntry, currentEntry, files, parentFiles);
    },
  });
};
