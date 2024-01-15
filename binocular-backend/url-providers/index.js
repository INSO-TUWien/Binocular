'use strict';

import GenericImporter from '../importer/GenericImporter.js';
import debug from 'debug';

import GitHubUrlProvider from './GitHubUrlProvider.js';

import GitLabUrlProvider from './GitLabUrlProvider.js';

import TravisCIUrlProvider from './TravisCIUrlProvider.js';

const log = debug('importer:ur-provider');

const vcsProvider = { context: null };
const ciProvider = { context: null };

const VcsComponents = {
  github: GitHubUrlProvider,
  gitlab: GitLabUrlProvider,
};

const CiComponents = {
  gitlab: GitLabUrlProvider,
  travis: TravisCIUrlProvider,
  github: GitHubUrlProvider,
};

//export const getVcsUrlProvider = importer.bind(null, 'vcs', VcsComponents, vcsProvider);
export const getVcsUrlProvider = function (repo, reporter, context, clean) {
  return importer('vcs', VcsComponents, vcsProvider, repo, reporter, context, clean);
};

//export const getCiUrlProvider = importer.bind(null, 'ci', CiComponents, ciProvider);
export const getCiUrlProvider = function (repo, reporter, context, clean) {
  return importer('ci', CiComponents, ciProvider, repo, reporter, context, clean);
};

/**
 * create singleton indexer for vcs
 *
 * @param componentType contains the selector type to get the correct component
 * @param components contains the set of components that can be generated
 * @param provider holds the corresponding singleton
 * @param repo contains the repository to init vcs
 * @param reporter contains the binocular-frontend reporter to see the current progress
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
