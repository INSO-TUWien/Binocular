'use strict';

import Connection from './Connection';
import Commit from './Commit';

class CommitCommitConnection extends Connection {
  constructor() {
    super(Commit, Commit);
  }
}
export default new CommitCommitConnection();
