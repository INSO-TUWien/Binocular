'use strict';

import Connection from '../Connection.ts';
import Module, { ModuleDao } from '../models/Module.ts';
import File, { FileDao } from '../models/File.ts';

interface ModuleFileConnectionDao {}

class ModuleFileConnection extends Connection<ModuleFileConnectionDao, ModuleDao, FileDao> {
  constructor() {
    super(Module, File);
  }
}
export default new ModuleFileConnection();
