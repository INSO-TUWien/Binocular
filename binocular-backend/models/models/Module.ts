'use strict';

import Model from '../Model';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';

import debug from 'debug';
import ModuleDto from '../../types/dtos/ModuleDto';

const log = debug('git:commit:module');

export interface ModuleDataType {
  path: string;
}
class Module extends Model<ModuleDataType> {
  constructor() {
    super({ name: 'Module' });
  }

  /**
   * get or create a new module based on its path
   *
   * @param _moduleData
   * @returns Module returns an already existing or newly created module
   */
  async persist(_moduleData: ModuleDto) {
    if (!_moduleData || !_moduleData.path) {
      throw IllegalArgumentError('Module does not hold the required data!');
    }

    const path = _moduleData.path;
    //delete data.path;
    const [instance] = await this.ensureBy('path', path, _moduleData, {});
    log(`Finished persisted ${path} with ${instance.data.path} and ${instance._id}!`);
    return instance;
  }
}

export default new Module();
