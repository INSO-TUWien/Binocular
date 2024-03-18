'use strict';

import Connection from './Connection';
import Module from './Module.js';

class ModuleModuleConnection extends Connection {
  constructor() {
    super(Module, Module);
  }
}
export default new ModuleModuleConnection();
