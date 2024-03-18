'use strict';

import Connection from './Connection';
import Commit from './Commit.js';

class CommitCommitConnection extends Connection {
  constructor() {
    super(Commit, Commit);
  }
}
export default new CommitCommitConnection();
