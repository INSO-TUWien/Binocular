'use strict';

const Model = require('./Model.js');
const Commit = require('./Commit.js');
const log = require('debug')('git');

const Clone = Model.define('Clone', {
  attributes: ['fingerprint', 'revision', 'type', 'sourcecode'],
  keyAttribute: 'fingerprint'
});

Clone.persist = function(fingerprint, revision, type, sourcecode) {
  const sha = fingerprint;

  return Clone.findById(sha).then(function(instance) {
    if (!instance) {
      log('Processing clone ', sha);

      return Clone.create({
        fingerprint: sha,
        revision: revision,
        type: type,
        sourcecode: sourcecode
      }).tap(function(clone) {
        return Commit.findById(revision).then(commit => {
          if (commit) {
            clone.connect(commit);
          }
        });
      });
    } else {
      return Commit.findById(revision)
        .then(commit => {
          if (commit) {
            instance.connect(commit);
          }
        })
        .then(() => {
          log('Skipped clone creation, only connected to commit: ', sha);

          return instance;
        });
    }
  });
};

module.exports = Clone;
