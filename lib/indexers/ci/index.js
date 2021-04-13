'use strict';

const GenericImporter = require('../../importer/GenericImporter');

let provider;

const components = {
  travis: require('./TravisCIIndexer'),
  gitlab: require('./GitLabCIIndexer')
};

/**
 * create singleton indexer for its
 *
 * @param repo contains the repository to init its
 * @param reporter contains the ui reporter to see the current progress
 * @param context contains the context of the application
 * @param clean force reset of the indexer
 * @returns {Promise<*>}
 */
module.exports = async (repo, reporter, context, clean) => {
  if (provider && !clean) {
    return provider;
  } else if (provider) {
    provider.stop();
  }
  provider = await GenericImporter(repo, 'CI', components, reporter, context);
  return provider;
};
