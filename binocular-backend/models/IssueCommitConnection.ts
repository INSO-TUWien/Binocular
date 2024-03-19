'use strict';

import Connection from './Connection';
import Issue from './Issue';
import Commit from './Commit';

class IssueCommitConnection extends Connection {
  constructor() {
    super(Issue, Commit);
  }
}
export default new IssueCommitConnection();
