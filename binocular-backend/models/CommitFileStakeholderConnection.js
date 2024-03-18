'use strict';

import Connection from './Connection';
import CommitFile from './CommitFileConnection.js';
import Stakeholder from './Stakeholder.js';

class CommitFileStakeholderConnection extends Connection {
  constructor() {
    super(CommitFile, Stakeholder);
  }
}
export default new CommitFileStakeholderConnection();
