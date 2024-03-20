'use strict';

import Connection from './Connection';
import Commit from './Commit';
import Stakeholder from './Stakeholder';

class CommitStakeholderConnection extends Connection {
  constructor() {
    super(Commit, Stakeholder);
  }
}
export default new CommitStakeholderConnection();
