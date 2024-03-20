'use strict';

import Connection from './Connection';
import Module, { ModuleDao } from './Module';

interface ModuleModuleConnectionDao {}

class ModuleModuleConnection extends Connection<ModuleModuleConnectionDao, ModuleDao, ModuleDao> {
  constructor() {
    super(Module, Module);
  }
}
export default new ModuleModuleConnection();
