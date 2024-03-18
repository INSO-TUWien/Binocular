'use strict';

import Connection from './Connection';
import Commit from './Commit.js';
import Build from './Build.js';

class CommitBuildConnection extends Connection {
  constructor() {
    super(Commit, Build);
  }
}

export default new CommitBuildConnection();
