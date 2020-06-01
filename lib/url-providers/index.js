'use strict';

const GenericImporter = require('../importer/GenericImporter');

let provider;

const components = {
  github: require('./GitHubUrlProvider.js'),
  gitlab: require('./GitLabUrlProvider.js')
};

/**
 * create singleton indexer for vcs
 *
 * @param repo contains the repository to init vcs
 * @param reporter contains the ui reporter to see the current progress
 * @param clean force reset of the provider
 * @returns {Promise<*>}
 */
module.exports = async (repo, reporter, clean) => {
  if (provider && !clean) {
    return provider;
  } else if (provider) {
    provider.stop();
  }
  provider = await GenericImporter(repo, 'VCS', components, reporter);
  return provider;
};
