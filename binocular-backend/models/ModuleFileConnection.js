'use strict';

import Connection from './Connection';
import Module from './Module';
import File from './File';

class ModuleFileConnection extends Connection {
  constructor() {
    super(Module, File);
  }
}
export default new ModuleFileConnection();
