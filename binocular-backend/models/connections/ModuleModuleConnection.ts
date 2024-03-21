'use strict';

import Connection from '../Connection.ts';
import Module, { ModuleDao } from '../models/Module';

interface ModuleModuleConnectionDao {}

class ModuleModuleConnection extends Connection<ModuleModuleConnectionDao, ModuleDao, ModuleDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Module, Module);
  }
}
export default new ModuleModuleConnection();
