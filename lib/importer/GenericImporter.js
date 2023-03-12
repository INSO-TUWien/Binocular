'use strict';

const _ = require('lodash');
const config = require('../config.js');
const IllegalArgumentError = require('../errors/IllegalArgumentError.js');
const log = require('debug')('url-provider');
const FindFiles = require('file-regex');

/**
 *  handler to create the corresponding ITS,VCS or CI component, that has been defined in the factory referring to the selected repository
 *
 * @param repo
 * @param componentType ITS, VCS or CI
 * @param componentFactory contains all available types of a corresponding component type
 * @param reporter (optional) can be needed to init somne indexers
 * @param context contains the context of the application
 * @returns {Promise<*>}
 */
module.exports = async (repo, componentType, componentFactory, reporter, context) => {
  if (!componentType) {
    throw new IllegalArgumentError('The factory is not (yet) available since the componentType has not been set!');
  }

  componentType = componentType.toUpperCase();

  const typePath = componentType !== 'CI' ? 'indexers.its' : 'indexers.ci';
  let type = _.toLower(config.get(typePath, 'auto'));

  if (type === 'auto' && componentType === 'CI') {
    type = await detectCIProvider(repo);
  }

  if (type === 'auto') {
    type = await detectRepoProvider(repo, componentType);
  }

  // get the component by its type
  const selectedComponentFactories = Object.keys(componentFactory)
    .filter((componentKey) => componentKey === type)
    .map((componentKey) => componentFactory[componentKey]);

  if (selectedComponentFactories.length !== 1 || typeof selectedComponentFactories[0] !== 'function') {
    throw new IllegalArgumentError(`The factory for the type ${type} of the indexer ${componentType} is not (yet) available`);
  }

  const provider = new selectedComponentFactories[0](repo, reporter);

  if (!provider) {
    throw new IllegalArgumentError(`${type} ${componentType} is not (yet) available`);
  }

  await provider.configure(config.get(type), context);
  return provider;
};

/**
 * analyse the repository to check the corresponding remote provider
 *
 * @param repo
 * @param componentType ITS, VCS, or CI
 * @returns {Promise<string>}
 */
async function detectRepoProvider(repo, componentType) {
  log(`Detecting ${componentType} from origin url...`);

  const url = await repo.getOriginUrl();
  if (url.match(/gitlab/i)) {
    return 'gitlab';
  } else if (url.match(/github.com/i)) {
    return 'github';
  } else {
    throw new IllegalArgumentError(`Unable to auto-detect ${componentType}. Please configure it manually`);
  }
}

/**
 * analyse the repository to check the corresponding remote provider
 *
 * @param repo contains the information of the repository
 * @returns {Promise<string>}
 */
// eslint-disable-next-line no-unused-vars
async function detectCIProvider(repo) {
  log('Detecting CI from files in the repo...');
  if (await FindFiles(await repo.getRoot(), /.travis\.ya?ml$/)) {
    return 'travis';
  }

  return 'auto';
}
