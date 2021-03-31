'use strict';

const GitIndexer = require('./GitIndexer.js');

let provider;

/**
 * create singleton indexer for vcs
 *
 * @param repo contains the repository to init vcs
 * @param urlProvider contains vcs url provider
 * @param reporter contains the ui reporter to see the current progress
 * @param clean force reset of the provider
 * @returns {Promise<*>}
 */
module.exports = (repo, urlProvider, reporter, clean) => {
  if (provider && !clean) {
    return provider;
  } else if (provider) {
    provider.stop();
  }
  provider = new GitIndexer(repo, urlProvider, reporter);
  return provider;
};
