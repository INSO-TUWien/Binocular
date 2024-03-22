'use strict';

import Connection from '../Connection';
import Module, { ModuleDataType } from '../models/Module';

interface ModuleModuleConnectionDataType {}

class ModuleModuleConnection extends Connection<ModuleModuleConnectionDataType, ModuleDataType, ModuleDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Module, Module);
  }
}
export default new ModuleModuleConnection();
