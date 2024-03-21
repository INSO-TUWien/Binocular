'use strict';

import Connection from '../Connection.ts';
import Module, { ModuleDao } from '../models/Module.ts';

interface ModuleModuleConnectionDao {}

class ModuleModuleConnection extends Connection<ModuleModuleConnectionDao, ModuleDao, ModuleDao> {
  constructor() {
    super(Module, Module);
  }
}
export default new ModuleModuleConnection();
