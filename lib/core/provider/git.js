'use strict';

const isomorphicGit = require('isomorphic-git');
const path = require('path');
const fs = require('fs');
const log = require('debug')('git.js');
const util = require('util');
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

Repository.prototype.getLatestCommitForBranch = function (branchName) {
  return isomorphicGit.log({
    fs,
    dir: this.currPath || '.',
    ref: 'origin/' + branchName,
    depth: 1,
  });
};

Repository.prototype.getFilePathsForBranch = function (branchName) {
  if (branchName) {
    if (!branchName.startsWith('origin')) {
      branchName = 'origin/' + branchName;
    }
    // retrieve all files of the project at the specified commit
    return isomorphicGit.listFiles({ fs, dir: this.currPath || '.', ref: branchName });
  }
  return [];
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
  //we have a problem here:
  //since multiple authors can have the same email address and one email address can also belong to multiple authors,
  // we need to know both the author name and the email address for ownership data.
  // but git blame only lets us see either the name or the mail address, but not both (in the noirmal output).
  // This is why we need to execute blame twice to get the full signature
  // TODO: write a parser for the git blame porcelain output so we don't have to execute blame twice

  try {
    return Promise.all([
      exec(`cd ${ctx.targetPath} && git blame -c -e --abbrev=1 --date=format: ${commit} -- ${file}`, { maxBuffer: 1024 * 100000 }),
      exec(`cd ${ctx.targetPath} && git blame -c --abbrev=1 --date=format: ${commit} -- ${file}`, { maxBuffer: 1024 * 100000 }),
    ])
      .then(([mailOut, nameOut]) => [mailOut.stdout, nameOut.stdout])
      .then(([emails, names]) => {
        const result = {};
        // get all lines in array
        // get all lines in array
        const mailLines = emails.split('\n');
        const nameLines = names.split('\n');
        for (let i = 0; i < mailLines.length; i++) {
          const mailLine = mailLines[i];
          const nameLine = nameLines[i];
          if (mailLine.length > 0) {
            const mail = mailLine.split('<')[1].split('>')[0].trim();
            const name = nameLine.split('(')[1].split('\t')[0].trim();
            const signature = name + ' <' + mail + '>';
            if (result[signature]) {
              result[signature] += 1;
            } else {
              result[signature] = 1;
            }
          }
        }
        return result;
      });
  } catch (e) {
    console.log('error ', e);
    return {};
  }
};

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
  //reset addition/deletion counters
  this.stats.additions = 0;
  this.stats.deletions = 0;

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
