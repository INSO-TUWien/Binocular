'use strict';

const GenericImporter = require('../../importer/GenericImporter');

let provider;

const components = {
  github: require('./GitHubIndexer.js'),
  gitlab: require('./GitLabITSIndexer.js')
};

/**
 * create singleton indexer for its
 *
 * @param repo contains the repository to init its
 * @param reporter contains the ui reporter to see the current progress
 * @param clean force reset of the indexer
 * @returns {Promise<*>}
 */
module.exports = async (repo, reporter, clean) => {
  if (provider && !clean) {
    return provider;
  } else if (provider) {
    provider.stop();
  }
  provider = await GenericImporter(repo, 'ITS', components, reporter);
  return provider;
};
