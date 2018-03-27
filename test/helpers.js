'use strict';

const Promise = require('bluebird');

const helpers = {
  stage: function(repo, filePath) {
    return Promise.resolve(repo.refreshIndex())
      .then(function(index) {
        this.index = index;

        return index.addByPath(filePath);
      })
      .then(function() {
        return this.index.write();
      })
      .then(function() {
        return this.index.writeTree();
      });
  },

  commit: function(repo, files, committer, message) {
    const fake = require('./fake.js');
    const sig = fake.signatureFor(committer.name, committer.email);

    message = message || fake.message();

    return repo.createCommitOnHead(files, sig, sig, message);
  }
};

module.exports = helpers;
