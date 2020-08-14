'use strict';

const Model = require('./Model.js');
const Promise = require('bluebird');
const IllegalArgumentError = require('../errors/IllegalArgumentError');
const log = require('debug')('git:commit:language');
const Language = Model.define('Language', { attributes: ['id', 'name', 'aliases', 'popular', 'color'] });

/**
 * get or create an new commit and connect it to its parents
 *
 * @param path
 * @param language
 * @returns Commit returns an already existing or newly created commit
 */
Language.persist = function(path, language) {
  if (!language || !language.id || !language.name) {
    throw IllegalArgumentError('language does not hold the required data!');
  }

  const id = language.id;
  delete language.id;
  return locker(id, () => Language.ensureById(id, language).spread(f => f)).tap(instance => {
    log(`Finished persisted ${path} with ${instance.data.name} and ${instance.data.id}!`);
  });
};

module.exports = Language;

const cache = {};

/**
 * prevent multi access of the database at the same time and make sure that language elements cannot be created at the same time
 * prevent deadlock
 * @param id
 * @param criticalZone
 * @returns {Promise<*>}
 */
function locker(id, criticalZone) {
  if (!(id in cache)) {
    cache[id] = Promise.resolve(criticalZone());
  }
  return cache[id];
}
