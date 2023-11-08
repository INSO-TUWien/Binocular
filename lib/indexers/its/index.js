'use strict';

import GenericImporter from '../../importer/GenericImporter.js';
import GitHubITSIndexer from './GitHubITSIndexer.js';
import GitLabITSIndexer from './GitLabITSIndexer.js';
let provider;

const components = {
  github: GitHubITSIndexer,
  gitlab: GitLabITSIndexer,
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
export default async (repo, reporter, context, clean) => {
  if (provider && !clean) {
    return provider;
  } else if (provider) {
    provider.stop();
  }
  provider = await GenericImporter(repo, 'ITS', components, reporter, context);
  return provider;
};
