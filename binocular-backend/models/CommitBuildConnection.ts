'use strict';

import Connection from './Connection';
import Commit from './Commit';
import Build from './Build';

class CommitBuildConnection extends Connection {
  constructor() {
    super(Commit, Build);
  }
}

export default new CommitBuildConnection();
