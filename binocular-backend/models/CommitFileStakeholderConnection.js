'use strict';

import Connection from './Connection';
import CommitFile from './CommitFileConnection';
import Stakeholder from './Stakeholder';

class CommitFileStakeholderConnection extends Connection {
  constructor() {
    super(CommitFile, Stakeholder);
  }
}
export default new CommitFileStakeholderConnection();
