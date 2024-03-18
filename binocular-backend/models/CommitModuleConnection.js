'use strict';

import Connection from './Connection';
import Commit from './Commit.js';
import Module from './Module.js';

class CommitModuleConnection extends Connection {
  constructor() {
    super(Commit, Module);
  }
}
export default new CommitModuleConnection();
