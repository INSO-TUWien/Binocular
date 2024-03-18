'use strict';

import Model from './Model';
import IllegalArgumentError from '../errors/IllegalArgumentError.js';

import debug from 'debug';

const log = debug('git:commit:module');

class Module extends Model {
  constructor() {
    super('Module', { attributes: ['path'] });
  }

  /**
   * get or create a new module based on its path
   *
   * @param data
   * @returns Module returns an already existing or newly created module
   */
  async persist(data) {
    if (!data || !data.path) {
      throw IllegalArgumentError('Module does not hold the required data!');
    }

    const path = data.path.toString();
    //delete data.path;
    const [instance] = await this.ensureBy('path', path, data, { ignoreUnknownAttributes: true });
    log(`Finished persisted ${path} with ${instance.data.path} and ${instance._id}!`);
    return instance;
  }
}

export default new Module();
