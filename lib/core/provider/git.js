'use strict';

const isomorphicGit = require('isomorphic-git');
const path = require('path');
const fs = require('fs');
const log = require('debug')('git.js');
const util = require('util');
const customUtils = require('../../utils');
const exec = util.promisify(require('child_process').exec);
const ctx = require('../../context.js');
const _ = require('lodash');

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

Repository.prototype.getLatestCommitForBranchRemote = function (branchName) {
  return isomorphicGit.log({
    fs,
    dir: this.currPath || '.',
    ref: 'origin/' + branchName,
    depth: 1,
  });
};

Repository.prototype.getLatestCommitForBranch = function (branchName) {
  return isomorphicGit.log({
    fs,
    dir: this.currPath || '.',
    ref: branchName,
    depth: 1,
  });
};

Repository.prototype.getFilePathsForBranchRemote = function (branchName) {
  try {
    if (branchName) {
      if (!branchName.startsWith('origin')) {
        branchName = 'origin/' + branchName;
      }
      // retrieve all files of the project at the specified commit
      return isomorphicGit.listFiles({ fs, dir: this.currPath || '.', ref: branchName });
    }
    return [];
  } catch {
    //can happen when branches are deleted and program is started with a database that includes the deleted branch
    return [];
  }
};

Repository.prototype.getFilePathsForBranch = function (branchName) {
  try {
    if (branchName) {
      // retrieve all files of the project at the specified commit
      return isomorphicGit.listFiles({ fs, dir: this.currPath || '.', ref: branchName });
    }
    return [];
  } catch {
    //can happen when branches are deleted and program is started with a database that includes the deleted branch
    return [];
  }
};

Repository.prototype.getPreviousFilenames = async function (branchName, fileName) {
  if (branchName && fileName) {
    if (!branchName.startsWith('origin')) {
      branchName = 'origin/' + branchName;
    }

    const command = `cd ${ctx.targetPath} && git log --format="%ad" --name-only --follow --diff-filter=AR ${branchName} -- ${fileName}`;
    try {
      const { stdout, other } = await exec(command, { maxBuffer: 1024 * 1000 });
      if (stdout.length === 0) return [];
      let groups = _.chunk(stdout.split('\n'), 3);
      //since exec returns a newline at the end, the last group is always empty. remove it
      groups = groups.filter((g) => g.length > 1);

      //the first element of the group is always the current filename.
      //we are only interested in the previous filenames, so we only need groups with length > 1
      if (groups.length <= 1) return [];
      //sample entry in group:
      //["Tue Nov 8 10:59:25 2022 +0100", "", "path/to/file"]
      return groups.map((g) => {
        return { fileName: g[2], timestamp: new Date(g[0]) };
      });
    } catch (e) {
      log('error in get-blame.js: ', e);
      return [];
    }
  }
  return [];
};

Repository.prototype.getOwnershipForFile = async function (file, commit) {
  try {
    const blameOutput = (await exec(`cd ${ctx.targetPath} && git blame -p ${commit} -- ${file}`, { maxBuffer: 1024 * 100000 })).stdout;
    return customUtils.parseBlameOutput(blameOutput);
  } catch (e) {
    console.log('error ', e);
    return {};
  }
};

Repository.prototype.getAllBranchesRemote = function () {
  return isomorphicGit.listBranches({ fs, dir: this.currPath || '.', remote: 'origin' });
};

Repository.prototype.getAllBranches = function () {
  return isomorphicGit.listBranches({ fs, dir: this.currPath || '.' });
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

Repository.prototype.createCommit = async function (files, author, message) {
  for (const filepath of files) {
    await isomorphicGit.add({ fs, dir: this.currPath || '.', filepath });
  }

  return isomorphicGit.commit({
    fs,
    dir: this.currPath || '.',
    message,
    author,
  });
};

Repository.prototype.createBranch = async function (ref) {
  return isomorphicGit.branch({
    fs,
    dir: this.currPath || '.',
    ref: ref,
  });
};

Repository.prototype.checkout = async function (ref) {
  return isomorphicGit.checkout({
    fs,
    dir: this.currPath || '.',
    ref: ref,
  });
};

Repository.prototype.listAllCommits = async function () {
  let branches = await this.getAllBranches();
  const commits = [];
  branches = branches.filter((b) => b !== 'HEAD').reverse();
  for (const b of branches) {
    let branchCommits = await isomorphicGit.log({
      fs,
      dir: this.currPath || '.',
      ref: b,
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

Repository.prototype.listAllCommitsRemote = async function () {
  let branches = await this.getAllBranchesRemote();
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
  //reset addition/deletion counters
  this.stats.additions = 0;
  this.stats.deletions = 0;

  let files;
  let parentFiles;
  try {
    files = sha === undefined ? [] : await isomorphicGit.listFiles({ fs, dir: repo.currPath || '.', ref: sha });
    parentFiles = parentSha === undefined ? [] : await isomorphicGit.listFiles({ fs, dir: repo.currPath || '.', ref: parentSha });
  } catch {
    files = [];
    parentFiles = [];
  }

  return isomorphicGit.walk({
    fs,
    dir: repo.currPath || '.',
    trees: [isomorphicGit.TREE({ ref: parentSha }), isomorphicGit.TREE({ ref: sha })],
    map: async function (filepath, [parentEntry, currentEntry]) {
      return mapFunction(filepath, parentEntry, currentEntry, files, parentFiles);
    },
  });
};
