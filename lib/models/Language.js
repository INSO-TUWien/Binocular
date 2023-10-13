'use strict';

import Model from './Model.js';
import IllegalArgumentError from '../errors/IllegalArgumentError.js';

import debug from 'debug';

const log = debug('git:commit:language');
const Language = Model.define('Language', {
  attributes: ['id', 'name', 'aliases', 'popular', 'color'],
  keyAttribute: 'id',
});

/**
 * get or create a new language
 *
 * @param path
 * @param language
 * @returns Language returns an already existing or newly created language
 */
Language.persist = function (path, language) {
  if (!language || !language.id || !language.name) {
    throw IllegalArgumentError('language does not hold the required data!');
  }

  const id = language.id.toString();
  delete language.id;
  return Language.ensureById(id, language).then(([instance, ensured]) => {
    log(`Finished persisted ${path} with ${instance.data.name} and ${instance.data.id}!`);
    return instance;
  });
};

export default Language;
