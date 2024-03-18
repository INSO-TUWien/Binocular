'use strict';

import Connection from './Connection';
import Commit from './Commit.js';
import Stakeholder from './Stakeholder.js';

class CommitStakeholderConnection extends Connection {
  constructor() {
    super(Commit, Stakeholder);
  }
}
export default new CommitStakeholderConnection();
