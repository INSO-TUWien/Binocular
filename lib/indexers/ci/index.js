'use strict';

const GitLabCIIndexer = require('./GitLabCIIndexer.js');
const config = require('../../config.js');

module.exports = (repository, reporter) => {
  const idx = new GitLabCIIndexer(repository, reporter);
  //if the configuration is successfully return the indexer
  return idx.configure(config.get('gitlab')).then(() => idx);
};
