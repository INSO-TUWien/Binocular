'use strict';

const Model = require('./Model.js');
const IllegalArgumentError = require('../errors/IllegalArgumentError');
const log = require('debug')('git:commit:module');

const Module = Model.define('Module', { attributes: ['path'] });

/**
 * get or create a new module based on its path
 *
 * @param data
 * @returns Module returns an already existing or newly created module
 */
Module.persist = function(data) {
  if (!data || !data.path) {
    throw IllegalArgumentError('Module does not hold the required data!');
  }

  const path = data.path.toString();
  delete data.path;
  return Module.ensureByPath(path, data, { ignoreUnknownAttributes: true }).spread(f => f).tap(instance => {
    log(`Finished persisted ${path} with ${instance.data.path} and ${instance._id}!`);
  });
};

module.exports = Module;
