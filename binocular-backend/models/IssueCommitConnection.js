'use strict';

import Connection from './Connection';
import Issue from './Issue.js';
import Commit from './Commit.js';

class IssueCommitConnection extends Connection {
  constructor() {
    super(Issue, Commit);
  }
}
export default new IssueCommitConnection();
