'use strict';

const GenericImporter = require('../importer/GenericImporter');
const log = require('debug')('importer:ur-provider');

const vcsProvider = { context: null };
const ciProvider = { context: null };

const VcsComponents = {
  github: require('./GitHubUrlProvider'),
  gitlab: require('./GitLabUrlProvider')
};

const CiComponents = {
  gitlab: require('./GitLabUrlProvider'),
  travis: require('./TravisCIUrlProvider')
};

module.exports = {
  getVcsUrlProvider: importer.bind(null, 'vcs', VcsComponents, vcsProvider),
  getCiUrlProvider: importer.bind(null, 'ci', CiComponents, ciProvider)
};

/**
 * create singleton indexer for vcs
 *
 * @param componentType contains the selector type to get the correct component
 * @param components contains the set of components that can be generated
 * @param provider holds the corresponding singleton
 * @param repo contains the repository to init vcs
 * @param reporter contains the ui reporter to see the current progress
 * @param context contains the context of the application
 * @param clean force reset of the provider
 * @returns {Promise<*>}
 */
async function importer(componentType, components, provider, repo, reporter, context, clean) {
  if (provider.context && !clean) {
    log(`use ${componentType} provider singleton!`);
    return provider.context;
  } else if (provider.context) {
    log(`Clear provider singleton of ${componentType}!`);
    provider.context.stop();
  }

  log(`Try to create new provider singleton of ${componentType}!`);
  provider.context = await GenericImporter(repo, componentType, components, reporter, context);
  return provider.context;
}
