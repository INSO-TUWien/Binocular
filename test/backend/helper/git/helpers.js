'use strict';

import fake from './repositoryFake.js';

const helpers = {
  stage: function (repo, filePath) {
    return Promise.resolve(repo.refreshIndex())
      .then(function (index) {
        this.index = index;

        return index.addByPath(filePath);
      })
      .then(function () {
        return this.index.write();
      })
      .then(function () {
        return this.index.writeTree();
      });
  },

  commit: function (repo, files, committer, message) {
    message = message || fake.message();

    return repo.createCommit(files, committer, message);
  },

  branch: function (repo, branchName) {
    return repo.createBranch(branchName);
  },

  checkout: function (repo, branchName) {
    return repo.checkout(branchName);
  },
};

export default helpers;
