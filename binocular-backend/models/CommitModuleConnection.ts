'use strict';

import Connection from './Connection';
import Commit from './Commit';
import Module from './Module';

class CommitModuleConnection extends Connection {
  constructor() {
    super(Commit, Module);
  }
}
export default new CommitModuleConnection();
