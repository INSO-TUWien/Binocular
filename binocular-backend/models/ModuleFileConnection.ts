'use strict';

import Connection from './Connection';
import Module, { ModuleDao } from './Module';
import File, { FileDao } from './File';

interface ModuleFileConnectionDao {}

class ModuleFileConnection extends Connection<ModuleFileConnectionDao, ModuleDao, FileDao> {
  constructor() {
    super(Module, File);
  }
}
export default new ModuleFileConnection();
