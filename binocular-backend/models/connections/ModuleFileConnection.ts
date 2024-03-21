'use strict';

import Connection from '../Connection';
import Module, { ModuleDao } from '../models/Module';
import File, { FileDao } from '../models/File';

interface ModuleFileConnectionDao {}

class ModuleFileConnection extends Connection<ModuleFileConnectionDao, ModuleDao, FileDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Module, File);
  }
}
export default new ModuleFileConnection();
