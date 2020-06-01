'use strict';

const GitIndexer = require('./GitIndexer.js');

let provider;

/**
 * create singleton indexer for vcs
 *
 * @param repo contains the repository to init vcs
 * @param reporter contains the ui reporter to see the current progress
 * @param clean force reset of the provider
 * @returns {Promise<*>}
 */
module.exports = (repo, reporter, clean) => {
  if (provider && !clean) {
    return provider;
  } else if (provider) {
    provider.stop();
  }
  provider = new GitIndexer(repo, reporter);
  return provider;
};
