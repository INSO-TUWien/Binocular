'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Git = require('nodegit');
const path = require('path');
const eventToPromise = require('event-to-promise');
const utils = require('./utils.js');

// error code signaling end of iteration in libgit2
const GIT_ITEROVER = -31;

function Repository(repo, path) {
  this.repo = repo;
  this.path = path;
  utils.getGithubOwnerAndRepo(this).then((match) => {
    this.owner = match[1]; // owner is needed for multi project storage in the DB
  });
}

Repository.fromPath = function(path) {
  return Promise.resolve(Git.Repository.open(path || '.')).then(repo => Repository.fromRepo(repo));
};

Repository.fromRepo = function(repo) {
  return Promise.resolve(new Repository(repo, repo.path()));
};

module.exports = Repository;

/**
 * Gets all References of a Repository.
 *
 * @returns { Promise<[Git.Reference]> }
 */
Repository.prototype.getAllReferences = function() {
  return Promise.resolve(this.repo.getReferences()).then(function (refList) {
    return refList.filter(function (reference) {
      return reference.type() === Git.Reference.TYPE.DIRECT;
    });
  });
};

Repository.prototype.getAllCommits = function() {
  this.getAllReferences()
    .map(ref => this.getCommitsOfBranch(ref))
    .then(_)
    .call('flatten')
    .call('uniqBy', c => c.id().toString())
    .call('value');
};

Repository.prototype.getRoot = function() {
  return path.resolve(this.path, '..');
};

Repository.prototype.getName = function() {
  return path.basename(path.dirname(this.path));
};

Repository.prototype.pathFromRoot = function(/* ...args */) {
  return path.resolve(this.getRoot(), ...arguments);
};

Repository.prototype.walk = function(fn) {
  return this.getAllReferences().then((refs) => {
    const walker = this.repo.createRevWalk();
    _.each(refs, ref => walker.pushRef(ref.name()));
    walker.sorting(Git.Revwalk.SORT.TOPOLOGICAL | Git.Revwalk.SORT.TIME | Git.Revwalk.SORT.REVERSE);

    const walk = () => {
      return Promise.resolve(walker.next())
        .then(oid => {
          return Git.Commit.lookup(this.repo, oid).then(function(c) {
            return Promise.try(() => fn(c)).then(walk);
          });
        })
        .catch({ errno: GIT_ITEROVER }, () => null);
    };

    return walk();
  });
};

Repository.prototype.getCommitsOfBranch = function(ref) {
  if (ref.isTag()) {
    return [];
  }

  return Promise.resolve(Git.Commit.lookup(this.repo, ref.target()))
    .bind({})
    .then(function(commit) {
      const history = [commit];
      const emitter = commit.history(Git.Revwalk.SORT.NONE);

      emitter.on('commit', function(ancestor) {
        history.push(ancestor);
      });

      emitter.start();

      return eventToPromise(emitter, 'end').then(() => history);
    });
};

Repository.prototype.getOriginUrl = function() {
  return Promise.resolve(this.repo.getRemote('origin')).call('url');
};

Repository.prototype.getOwner = function () {
  return this.owner;
};
