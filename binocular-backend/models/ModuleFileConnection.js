'use strict';

import Connection from './Connection';
import Module from './Module.js';
import File from './File.js';

class ModuleFileConnection extends Connection {
  constructor() {
    super(Module, File);
  }
}
export default new ModuleFileConnection();
