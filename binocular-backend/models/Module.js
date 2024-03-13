'use strict';

import Model from './Model.js';
import IllegalArgumentError from '../errors/IllegalArgumentError.js';

import debug from 'debug';

const log = debug('git:commit:module');

const Module = new Model('Module', { attributes: ['path'] });

/**
 * get or create a new module based on its path
 *
 * @param data
 * @returns Module returns an already existing or newly created module
 */
Module.persist = function (data) {
  if (!data || !data.path) {
    throw IllegalArgumentError('Module does not hold the required data!');
  }

  const path = data.path.toString();
  //delete data.path;
  return Module.ensureBy('path', path, data, { ignoreUnknownAttributes: true }).then(([instance]) => {
    log(`Finished persisted ${path} with ${instance.data.path} and ${instance._id}!`);
    return instance;
  });
};

export default Module;
