'use strict';

import Connection from '../Connection';
import Module, { ModuleDataType } from '../models/Module';
import File, { FileDataType } from '../models/File';

interface ModuleFileConnectionDataType {}

class ModuleFileConnection extends Connection<ModuleFileConnectionDataType, ModuleDataType, FileDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Module, File);
  }
}
export default new ModuleFileConnection();
