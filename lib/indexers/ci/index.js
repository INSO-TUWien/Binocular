'use strict';

const GitLabCIIndexer = require('./GitLabCIIndexer.js');

module.exports = function() {
  return new GitLabCIIndexer(...arguments);
};
