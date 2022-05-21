'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
//const Git = require('nodegit');
const isomorphicGit = require('isomorphic-git');
const path = require('path');
const eventToPromise = require('event-to-promise');
const fs = require('fs');
// error code signaling end of iteration in libgit2
const GIT_ITEROVER = -31;

function Repository(/*repo,*/ path) {
  //this.repo = repo;
  this.path = path;
}

Repository.fromPath = function (currPath) {
  return Promise.resolve(isomorphicGit.init({ fs, dir: currPath || '.' })).then(() => {
    return Promise.resolve(new Repository(path.resolve('.git')));
  });

  //return Promise.resolve(Git.Repository.open(currPath || '.')).then((repo) => Repository.fromRepo(repo));
};

Repository.fromRepo = function (repo) {
  return Promise.resolve(new Repository(repo, repo.path()));
};

module.exports = Repository;

Repository.prototype.getAllBranches = function () {
  //return this.repo.getReferenceNames(Git.Reference.TYPE.ALL);
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
  //return Promise.resolve(this.repo.getRemote('origin')).call('url');
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
      ref: 'origin/' + b
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
  let files = await isomorphicGit.listFiles({ fs, dir: '.', ref: sha });
  let parentFiles = await isomorphicGit.listFiles({ fs, dir: '.', ref: parentSha });

  return isomorphicGit.walk({
    fs,
    dir: '.',
    trees: [isomorphicGit.TREE({ ref: parentSha }), isomorphicGit.TREE({ ref: sha })],
    map: async function (filepath, [parentEntry, currentEntry]) {
      return mapFunction(filepath, parentEntry, currentEntry, files, parentFiles);
    }
  });
};
